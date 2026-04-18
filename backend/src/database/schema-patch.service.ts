import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Postgres + TypeORM `synchronize` đôi khi không tự thêm/đổi cột khi DB đã tồn tại (đặc biệt đổi enum → varchar).
 * Chạy một lần khi boot để đảm bảo bảng `users` có cột `role` và gỡ `adminRole` cũ nếu còn.
 */
@Injectable()
export class SchemaPatchService implements OnModuleInit {
  private readonly log = new Logger(SchemaPatchService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.patchUsersRoleColumn();
      await this.patchRecyclingRequestStatusEnum();
      await this.patchReturnApprovedToStoredRecycling();
      await this.patchRecyclingReturnFields();
      await this.backfillReturnRequestsToRecycling();
    } catch (e) {
      this.log.warn(`Schema patch skipped or failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  private async patchUsersRoleColumn() {
    const q = `
DO $patch$
BEGIN
  -- Thêm cột role nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "role" character varying(32) NOT NULL DEFAULT 'USER';
  END IF;

  -- Nếu còn cột adminRole (schema cũ): copy sang role rồi xóa
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'adminRole'
  ) THEN
    UPDATE "users" SET "role" = CASE
      WHEN CAST("adminRole" AS text) IN ('NONE', 'none') THEN 'USER'
      WHEN CAST("adminRole" AS text) IS NULL OR CAST("adminRole" AS text) = '' THEN 'USER'
      ELSE CAST("adminRole" AS text)
    END;
    ALTER TABLE "users" DROP COLUMN "adminRole";
  END IF;
END
$patch$;
`;
    await this.dataSource.query(q);
    this.log.log('users.role schema patch applied (ok)');
  }

  /** Thêm giá trị enum STORED cho cột recycling_requests.status (Postgres). */
  private async patchRecyclingRequestStatusEnum() {
    const rows = await this.dataSource.query(`
      SELECT udt_name::text AS name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'recycling_requests'
        AND column_name = 'status'
      LIMIT 1
    `);
    const udt = rows?.[0]?.name as string | undefined;
    if (!udt) return;

    await this.dataSource.query(`
      DO $e$
      BEGIN
        ALTER TYPE "${udt.replace(/"/g, '""')}" ADD VALUE 'STORED';
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $e$;
    `);
    this.log.log('recycling_requests.status enum STORED patch applied (ok)');
  }

  /** Đơn hoàn trả đã APPROVED: đồng bộ đơn thu gom sang STORED (kho lưu trữ). */
  private async patchReturnApprovedToStoredRecycling() {
    await this.dataSource.query(`
      UPDATE recycling_requests rr
      SET status = 'STORED'
      FROM return_requests r
      WHERE r."recyclingRequestId" = rr.id
        AND r.status = 'APPROVED'
        AND rr.status = 'COMPLETED';
    `);
    this.log.log('return APPROVED → recycling STORED backfill applied (ok)');
  }

  /** Thêm các cột lưu “hoàn trả” ngay trên recycling_requests. */
  private async patchRecyclingReturnFields() {
    const q = `
DO $patch$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recycling_requests'
      AND column_name = 'returnStatus'
  ) THEN
    ALTER TABLE "recycling_requests" ADD COLUMN "returnStatus" character varying(16) NOT NULL DEFAULT 'NONE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recycling_requests'
      AND column_name = 'returnReason'
  ) THEN
    ALTER TABLE "recycling_requests" ADD COLUMN "returnReason" text NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recycling_requests'
      AND column_name = 'returnAdminNote'
  ) THEN
    ALTER TABLE "recycling_requests" ADD COLUMN "returnAdminNote" text NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recycling_requests'
      AND column_name = 'returnDecidedByUserId'
  ) THEN
    ALTER TABLE "recycling_requests" ADD COLUMN "returnDecidedByUserId" character varying NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recycling_requests'
      AND column_name = 'returnDecidedAt'
  ) THEN
    ALTER TABLE "recycling_requests" ADD COLUMN "returnDecidedAt" timestamptz NULL;
  END IF;
END
$patch$;
`;
    await this.dataSource.query(q);
    this.log.log('recycling_requests return fields patch applied (ok)');
  }

  /**
   * Backfill dữ liệu lịch sử từ bảng return_requests (schema cũ) sang recycling_requests.*.
   * Sau khi backfill xong, code sẽ dùng recycling_requests làm “1 đơn”.
   */
  private async backfillReturnRequestsToRecycling() {
    await this.dataSource.query(`
      UPDATE recycling_requests rr
      SET
        "returnStatus" = COALESCE(NULLIF(rr."returnStatus", 'NONE'), r.status),
        "returnReason" = COALESCE(rr."returnReason", r.reason),
        "returnAdminNote" = COALESCE(rr."returnAdminNote", r."adminNote"),
        "returnDecidedByUserId" = COALESCE(rr."returnDecidedByUserId", r."decidedByUserId"),
        "returnDecidedAt" = COALESCE(rr."returnDecidedAt", r."decidedAt")
      FROM return_requests r
      WHERE r."recyclingRequestId" = rr.id
        AND (rr."returnStatus" IS NULL OR rr."returnStatus" = 'NONE');
    `);
    this.log.log('backfill return_requests → recycling_requests.return* applied (ok)');
  }
}
