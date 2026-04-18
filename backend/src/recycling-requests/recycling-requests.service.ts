import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RecyclingRequest, RequestStatus, ReturnFlowStatus } from './recycling-request.entity';
import { UsersService } from '../users/users.service';
import type { AdminScope } from '../common/admin-scope.util';
import { WarehouseItem } from '../warehouse/warehouse-item.entity';

export type RecyclingDashboardTrendPoint = {
  monthIndex: number;
  label: string;
  yearMonth: string;
  count: number;
};

export type RecyclingDashboardGroup = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

export type RecyclingDashboardStats = {
  totalDevices: number;
  totalDevicesTrendPct: number | null;
  thisMonthCount: number;
  thisMonthTrendPct: number | null;
  lastMonthCount: number;
  last30Count: number;
  trend: RecyclingDashboardTrendPoint[];
  groups: RecyclingDashboardGroup[];
};

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

const GROUP_KEYS = {
  computer: 'Máy tính',
  peripheral: 'Thiết bị ngoại vi',
  office: 'Máy văn phòng',
  other: 'Khác',
} as const;

function classifyDeviceGroup(deviceType: string): keyof typeof GROUP_KEYS {
  const t = (deviceType || '').trim();
  if (t.includes('Máy tính')) return 'computer';
  if (t === 'Chuột' || t === 'Điện thoại') return 'peripheral';
  if (t.includes('Máy in') || t.toLowerCase().includes('printer')) return 'office';
  return 'other';
}

@Injectable()
export class RecyclingRequestsService {
  constructor(
    @InjectRepository(RecyclingRequest)
    private requestsRepository: Repository<RecyclingRequest>,
    @InjectRepository(WarehouseItem)
    private warehouseRepo: Repository<WarehouseItem>,
    private usersService: UsersService,
  ) {}

  async create(
    userId: string,
    data: Partial<RecyclingRequest>,
  ): Promise<RecyclingRequest> {
    const trackingCode =
      'ECO-' + Math.floor(1000 + Math.random() * 9000).toString();
    const newRequest = this.requestsRepository.create({
      deviceType: data.deviceType,
      deviceName: data.deviceName,
      manufacturer: data.manufacturer,
      condition: data.condition,
      images: data.images,
      collectionPointId: data.collectionPointId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      userId: userId,
      trackingCode: trackingCode,
    } as import('typeorm').DeepPartial<RecyclingRequest>);
    await this.usersService.addPoints(userId, 100);
    return this.requestsRepository.save(newRequest as any);
  }

  async findByTrackingCode(
    trackingCode: string,
  ): Promise<RecyclingRequest | null> {
    return this.requestsRepository.findOne({
      where: { trackingCode },
      relations: ['collectionPoint'],
    });
  }

  async findByUser(userId: string): Promise<RecyclingRequest[]> {
    return this.requestsRepository.find({
      where: { userId },
      relations: ['collectionPoint'],
    });
  }

  async findByIdForUser(userId: string, id: string): Promise<RecyclingRequest> {
    const rr = await this.requestsRepository.findOne({
      where: { id },
      relations: ['collectionPoint'],
    });
    if (!rr) throw new NotFoundException('Recycling request not found');
    if (String(rr.userId) !== String(userId)) throw new ForbiddenException();
    return rr;
  }

  async adminList(params: {
    collectionPointId?: string | null;
    scopeAll?: boolean;
    q?: string;
    status?: string;
    returnStatus?: string;
    /** Ngày tạo đơn (theo múi +07), YYYY-MM-DD */
    date?: string;
  }): Promise<RecyclingRequest[]> {
    const qb = this.requestsRepository
      .createQueryBuilder('rr')
      .leftJoinAndSelect('rr.collectionPoint', 'cp')
      .leftJoinAndSelect('rr.user', 'u')
      .orderBy('rr.createdAt', 'DESC');

    if (!params.scopeAll) {
      if (!params.collectionPointId) return [];
      qb.andWhere('rr.collectionPointId = :cpId', { cpId: params.collectionPointId });
    }
    if (params.q) {
      const q = `%${params.q}%`;
      qb.andWhere(
        '(rr.trackingCode ILIKE :q OR rr.deviceName ILIKE :q OR u.email ILIKE :q)',
        { q },
      );
    }

    const st = params.status?.trim();
    if (st) qb.andWhere('rr.status = :st', { st });

    const rs = params.returnStatus?.trim();
    if (rs) qb.andWhere('rr.returnStatus = :rs', { rs });

    const day = params.date?.trim();
    if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const dayStart = new Date(`${day}T00:00:00+07:00`);
      const dayEnd = new Date(`${day}T23:59:59.999+07:00`);
      qb.andWhere('rr.createdAt BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd });
    }

    return qb.getMany();
  }

  async adminGet(id: string, scope: AdminScope): Promise<RecyclingRequest> {
    const rr = await this.requestsRepository.findOne({
      where: { id },
      relations: ['collectionPoint', 'user'],
    });
    if (!rr) throw new NotFoundException('Recycling request not found');
    if (!scope.scopeAll) {
      if (!scope.collectionPointId) throw new ForbiddenException();
      if (String(rr.collectionPointId) !== String(scope.collectionPointId)) throw new ForbiddenException();
    }
    return rr;
  }

  /**
   * Admin xử lý đơn ngay (không bắt buộc phải có luồng hoàn trả / returnStatus).
   * APPROVE: nhập kho + set đơn sang STORED
   * REJECT: từ chối kiểm hàng (không nhập kho)
   */
  async adminDecision(
    adminUserId: string,
    id: string,
    body: { decision: 'APPROVE' | 'REJECT'; adminNote?: string },
    scope: AdminScope,
  ): Promise<RecyclingRequest> {
    const rr = await this.requestsRepository.findOne({ where: { id } });
    if (!rr) throw new NotFoundException('Recycling request not found');
    if (!scope.scopeAll) {
      if (!scope.collectionPointId) throw new ForbiddenException();
      if (String(rr.collectionPointId) !== String(scope.collectionPointId)) throw new ForbiddenException();
    }

    if (rr.status === RequestStatus.CANCELLED) {
      throw new BadRequestException('Order is cancelled');
    }
    if (rr.status === RequestStatus.STORED) {
      throw new BadRequestException('Order already stored');
    }

    const rs = rr.returnStatus;
    if (rs === ReturnFlowStatus.APPROVED || rs === ReturnFlowStatus.REJECTED) {
      throw new BadRequestException('Decision already made');
    }

    return this.requestsRepository.manager.transaction(async (em) => {
      const row = await em.findOne(RecyclingRequest, { where: { id } });
      if (!row) throw new NotFoundException('Recycling request not found');

      row.returnAdminNote = body.adminNote ?? row.returnAdminNote;
      row.returnDecidedByUserId = adminUserId;
      row.returnDecidedAt = new Date();

      if (body.decision === 'APPROVE') {
        row.status = RequestStatus.STORED;
        row.returnStatus = ReturnFlowStatus.APPROVED;

        const existed = await em.findOne(WarehouseItem, { where: { recyclingRequestId: row.id } });
        if (!existed) {
          const w = em.create(WarehouseItem, {
            recyclingRequestId: row.id,
            trackingCode: row.trackingCode,
            deviceType: row.deviceType,
            deviceName: row.deviceName,
            manufacturer: row.manufacturer,
            condition: row.condition as any,
            images: row.images,
            storedByUserId: adminUserId,
          });
          await em.save(w);
        }
      } else {
        row.returnStatus = ReturnFlowStatus.REJECTED;
      }

      return em.save(row);
    });
  }

  async getRecyclingDashboardStats(scope: AdminScope): Promise<RecyclingDashboardStats> {
    if (!scope.scopeAll && !scope.collectionPointId) {
      return this.emptyDashboard();
    }

    const scopeWhere = (qb: SelectQueryBuilder<RecyclingRequest>) => {
      if (!scope.scopeAll) {
        qb.andWhere('rr.collectionPointId = :cpId', {
          cpId: scope.collectionPointId as string,
        });
      }
    };

    const now = new Date();
    const totalDevices = await (() => {
      const qb = this.requestsRepository.createQueryBuilder('rr');
      scopeWhere(qb);
      return qb.getCount();
    })();

    const startThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const thisMonthCount = await (() => {
      const qb = this.requestsRepository.createQueryBuilder('rr');
      scopeWhere(qb);
      qb.andWhere('rr.createdAt >= :stm', { stm: startThisMonth });
      return qb.getCount();
    })();

    const lastMonthCount = await (() => {
      const qb = this.requestsRepository.createQueryBuilder('rr');
      scopeWhere(qb);
      qb.andWhere('rr.createdAt >= :slm', { slm: startLastMonth }).andWhere(
        'rr.createdAt < :stm',
        { stm: startThisMonth },
      );
      return qb.getCount();
    })();

    const thirtyMs = 30 * 24 * 60 * 60 * 1000;
    const end = now.getTime();
    const last30Start = new Date(end - thirtyMs);
    const prev30Start = new Date(end - 2 * thirtyMs);

    const last30Count = await (() => {
      const qb = this.requestsRepository.createQueryBuilder('rr');
      scopeWhere(qb);
      qb.andWhere('rr.createdAt >= :a', { a: last30Start });
      return qb.getCount();
    })();

    const prev30Count = await (() => {
      const qb = this.requestsRepository.createQueryBuilder('rr');
      scopeWhere(qb);
      qb.andWhere('rr.createdAt >= :a', { a: prev30Start }).andWhere(
        'rr.createdAt < :b',
        { b: last30Start },
      );
      return qb.getCount();
    })();

    const sixMonthsStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const monthRows = await (() => {
      const qb = this.requestsRepository
        .createQueryBuilder('rr')
        .select(`TO_CHAR(date_trunc('month', rr."createdAt"), 'YYYY-MM')`, 'ym')
        .addSelect('COUNT(*)', 'cnt')
        .where('rr.createdAt >= :from', { from: sixMonthsStart });
      scopeWhere(qb);
      qb.groupBy(`TO_CHAR(date_trunc('month', rr."createdAt"), 'YYYY-MM')`).orderBy(
        'ym',
        'ASC',
      );
      return qb.getRawMany<{ ym: string; cnt: string }>();
    })();

    const trendMap = new Map(monthRows.map((r) => [r.ym, parseInt(r.cnt, 10)]));

    const trend: RecyclingDashboardTrendPoint[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1));
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      trend.push({
        monthIndex: i + 1,
        label: `THÁNG ${i + 1}`,
        yearMonth: ym,
        count: trendMap.get(ym) ?? 0,
      });
    }

    const typeRows = await (() => {
      const qb = this.requestsRepository
        .createQueryBuilder('rr')
        .select('rr.deviceType', 'deviceType')
        .addSelect('COUNT(*)', 'cnt')
        .groupBy('rr.deviceType');
      scopeWhere(qb);
      return qb.getRawMany<{ deviceType: string; cnt: string }>();
    })();

    const totals: Record<string, number> = {
      computer: 0,
      peripheral: 0,
      office: 0,
      other: 0,
    };
    for (const row of typeRows) {
      const k = classifyDeviceGroup(row.deviceType);
      totals[k] += parseInt(row.cnt, 10);
    }
    const groupSum = Object.values(totals).reduce((a, b) => a + b, 0);
    const groups: RecyclingDashboardGroup[] = (Object.keys(GROUP_KEYS) as Array<keyof typeof GROUP_KEYS>).map(
      (key) => ({
        key,
        label: GROUP_KEYS[key],
        count: totals[key],
        percent:
          groupSum === 0 ? 0 : Math.round((totals[key] / groupSum) * 100),
      }),
    );

    return {
      totalDevices,
      totalDevicesTrendPct: pctDelta(last30Count, prev30Count),
      thisMonthCount,
      thisMonthTrendPct: pctDelta(thisMonthCount, lastMonthCount),
      lastMonthCount,
      last30Count,
      trend,
      groups,
    };
  }

  private emptyDashboard(): RecyclingDashboardStats {
    const trend: RecyclingDashboardTrendPoint[] = [];
    for (let i = 0; i < 6; i++) {
      trend.push({
        monthIndex: i + 1,
        label: `THÁNG ${i + 1}`,
        yearMonth: '',
        count: 0,
      });
    }
    const groups: RecyclingDashboardGroup[] = (Object.keys(GROUP_KEYS) as Array<keyof typeof GROUP_KEYS>).map(
      (key) => ({
        key,
        label: GROUP_KEYS[key],
        count: 0,
        percent: 0,
      }),
    );
    return {
      totalDevices: 0,
      totalDevicesTrendPct: null,
      thisMonthCount: 0,
      thisMonthTrendPct: null,
      lastMonthCount: 0,
      last30Count: 0,
      trend,
      groups,
    };
  }
}
