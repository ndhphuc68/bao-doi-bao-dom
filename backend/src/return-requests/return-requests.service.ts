import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequestStatus } from './return-request.entity';
import {
  RecyclingRequest,
  RequestStatus,
  ReturnFlowStatus,
} from '../recycling-requests/recycling-request.entity';
import { WarehouseItem } from '../warehouse/warehouse-item.entity';

type CreateReturnRequestDto = {
  recyclingRequestId: string;
  reason?: string;
};

type UpdateReturnStatusDto = {
  status: ReturnRequestStatus;
  adminNote?: string;
};

function assertAllowedTransition(from: ReturnRequestStatus, to: ReturnRequestStatus) {
  /** Luồng chính: PENDING → (APPROVED | REJECTED | CANCELLED). APPROVED = đã nhập kho, kết thúc. */
  const allowed: Record<ReturnRequestStatus, ReturnRequestStatus[]> = {
    PENDING: [ReturnRequestStatus.APPROVED, ReturnRequestStatus.REJECTED, ReturnRequestStatus.CANCELLED],
    APPROVED: [],
    REJECTED: [],
    RECEIVED: [ReturnRequestStatus.COMPLETED],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (from === to) return;
  if (!allowed[from]?.includes(to)) {
    throw new BadRequestException(`Invalid status transition: ${from} -> ${to}`);
  }
}

function mapReturnFlowToLegacyStatus(s: ReturnFlowStatus): ReturnRequestStatus {
  // Giữ route/DTO “return-requests” cũ để không phải đổi UI nhiều.
  // Luồng mới chỉ dùng PENDING/APPROVED/REJECTED/CANCELLED.
  switch (s) {
    case ReturnFlowStatus.PENDING:
      return ReturnRequestStatus.PENDING;
    case ReturnFlowStatus.APPROVED:
      return ReturnRequestStatus.APPROVED;
    case ReturnFlowStatus.REJECTED:
      return ReturnRequestStatus.REJECTED;
    case ReturnFlowStatus.CANCELLED:
      return ReturnRequestStatus.CANCELLED;
    default:
      return ReturnRequestStatus.CANCELLED;
  }
}

function mapLegacyToReturnFlow(s: ReturnRequestStatus): ReturnFlowStatus {
  switch (s) {
    case ReturnRequestStatus.PENDING:
      return ReturnFlowStatus.PENDING;
    case ReturnRequestStatus.APPROVED:
      return ReturnFlowStatus.APPROVED;
    case ReturnRequestStatus.REJECTED:
      return ReturnFlowStatus.REJECTED;
    case ReturnRequestStatus.CANCELLED:
      return ReturnFlowStatus.CANCELLED;
    default:
      // RECEIVED/COMPLETED: luồng cũ, không còn dùng cho nghiệp vụ “1 đơn”.
      return ReturnFlowStatus.APPROVED;
  }
}

@Injectable()
export class ReturnRequestsService {
  constructor(
    @InjectRepository(RecyclingRequest)
    private readonly recyclingRepo: Repository<RecyclingRequest>,
    @InjectRepository(WarehouseItem)
    private readonly warehouseRepo: Repository<WarehouseItem>,
  ) {}

  async createForUser(userId: string, dto: CreateReturnRequestDto) {
    const rr = await this.recyclingRepo.findOne({
      where: { id: dto.recyclingRequestId },
    });
    if (!rr) throw new NotFoundException('Recycling request not found');
    if (String(rr.userId) !== String(userId)) throw new ForbiddenException();
    if (rr.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException('Recycling request is not completed yet');
    }

    // “Đơn hoàn trả” == một phần của “đơn thu gom”: set returnStatus trên chính rr.
    if (rr.returnStatus && rr.returnStatus !== ReturnFlowStatus.NONE && rr.returnStatus !== ReturnFlowStatus.CANCELLED) {
      return this.adminShapeFromRecycling(rr);
    }

    rr.returnStatus = ReturnFlowStatus.PENDING;
    rr.returnReason = dto.reason ?? rr.returnReason;
    rr.returnAdminNote = null as any;
    rr.returnDecidedAt = null as any;
    rr.returnDecidedByUserId = null as any;
    const saved = await this.recyclingRepo.save(rr);
    return this.adminShapeFromRecycling(saved);
  }

  async listForUser(userId: string) {
    const rows = await this.recyclingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows
      .filter((r) => r.returnStatus && r.returnStatus !== ReturnFlowStatus.NONE)
      .map((r) => this.adminShapeFromRecycling(r));
  }

  async cancelForUser(userId: string, id: string) {
    const rr = await this.recyclingRepo.findOne({ where: { id } });
    if (!rr) throw new NotFoundException('Return request not found');
    if (String(rr.userId) !== String(userId)) throw new ForbiddenException();
    if (rr.returnStatus !== ReturnFlowStatus.PENDING) {
      throw new BadRequestException('Only pending return requests can be cancelled');
    }

    rr.returnStatus = ReturnFlowStatus.CANCELLED;
    const saved = await this.recyclingRepo.save(rr);
    return this.adminShapeFromRecycling(saved);
  }

  async adminList(params: {
    status?: ReturnRequestStatus;
    q?: string;
    deviceType?: string;
    /** Ngày tạo đơn (theo múi +07), YYYY-MM-DD */
    date?: string;
    /** Chỉ đơn tại điểm thu gom này (admin cửa hàng) */
    collectionPointId?: string | null;
    /** Admin tổng xem toàn bộ */
    scopeAll?: boolean;
  }) {
    const qb = this.recyclingRepo
      .createQueryBuilder('rr')
      .leftJoinAndSelect('rr.user', 'u')
      .orderBy('rr.createdAt', 'DESC');

    qb.andWhere('rr.returnStatus IS NOT NULL AND rr.returnStatus <> :none', { none: ReturnFlowStatus.NONE });
    if (params.status) {
      qb.andWhere('rr.returnStatus = :rs', { rs: mapLegacyToReturnFlow(params.status) });
    }
    if (params.q) {
      const q = `%${params.q}%`;
      qb.andWhere('(rr.trackingCode ILIKE :q OR rr.deviceName ILIKE :q OR u.email ILIKE :q)', { q });
    }
    const dt = params.deviceType?.trim();
    if (dt) qb.andWhere('rr.deviceType ILIKE :deviceType', { deviceType: `%${dt}%` });
    const day = params.date?.trim();
    if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const dayStart = new Date(`${day}T00:00:00+07:00`);
      const dayEnd = new Date(`${day}T23:59:59.999+07:00`);
      qb.andWhere('rr.createdAt BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd });
    }
    if (!params.scopeAll) {
      if (!params.collectionPointId) return [];
      qb.andWhere('rr.collectionPointId = :cpId', { cpId: params.collectionPointId });
    }

    const rows = await qb.getMany();
    return rows.map((r) => this.adminShapeFromRecycling(r));
  }

  async adminGet(
    id: string,
    opts?: { collectionPointId?: string | null; scopeAll?: boolean },
  ) {
    const rr = await this.recyclingRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!rr) throw new NotFoundException('Return request not found');
    if (!rr.returnStatus || rr.returnStatus === ReturnFlowStatus.NONE) throw new NotFoundException('Return request not found');
    if (!opts?.scopeAll) {
      if (!opts?.collectionPointId) throw new ForbiddenException();
      const cp = rr.collectionPointId;
      if (String(cp) !== String(opts.collectionPointId)) throw new ForbiddenException();
    }
    return this.adminShapeFromRecycling(rr);
  }

  async adminUpdateStatus(
    adminUserId: string,
    id: string,
    dto: UpdateReturnStatusDto,
    opts?: { collectionPointId?: string | null; scopeAll?: boolean },
  ) {
    const rr = await this.recyclingRepo.findOne({ where: { id } });
    if (!rr) throw new NotFoundException('Return request not found');
    if (!rr.returnStatus || rr.returnStatus === ReturnFlowStatus.NONE) throw new NotFoundException('Return request not found');
    if (!opts?.scopeAll) {
      if (!opts?.collectionPointId) throw new ForbiddenException();
      const cp = rr.collectionPointId;
      if (String(cp) !== String(opts.collectionPointId)) throw new ForbiddenException();
    }

    const currentLegacy = mapReturnFlowToLegacyStatus(rr.returnStatus);
    assertAllowedTransition(currentLegacy, dto.status);

    rr.returnStatus = mapLegacyToReturnFlow(dto.status);
    rr.returnAdminNote = dto.adminNote ?? rr.returnAdminNote;
    rr.returnDecidedByUserId = adminUserId;
    rr.returnDecidedAt = new Date();

    // Nếu admin xác nhận -> vào kho lưu trữ
    if (dto.status === ReturnRequestStatus.APPROVED) {
      rr.status = RequestStatus.STORED;
    }

    const saved = await this.recyclingRepo.manager.transaction(async (em) => {
      const savedRr = await em.save(rr);

      if (dto.status === ReturnRequestStatus.APPROVED) {
        // Idempotent: mỗi đơn chỉ tạo 1 bản ghi kho
        const existed = await em.findOne(WarehouseItem, { where: { recyclingRequestId: savedRr.id } });
        if (!existed) {
          const w = em.create(WarehouseItem, {
            recyclingRequestId: savedRr.id,
            trackingCode: savedRr.trackingCode,
            deviceType: savedRr.deviceType,
            deviceName: savedRr.deviceName,
            manufacturer: savedRr.manufacturer,
            condition: (savedRr as any).condition,
            images: (savedRr as any).images,
            storedByUserId: adminUserId,
          });
          await em.save(w);
        }
      }

      return savedRr;
    });

    return this.adminShapeFromRecycling(saved);
  }

  private adminShapeFromRecycling(rr: RecyclingRequest) {
    return {
      id: rr.id,
      status: mapReturnFlowToLegacyStatus(rr.returnStatus || ReturnFlowStatus.NONE),
      reason: rr.returnReason ?? null,
      adminNote: rr.returnAdminNote ?? null,
      decidedByUserId: rr.returnDecidedByUserId ?? null,
      decidedAt: rr.returnDecidedAt ? rr.returnDecidedAt.toISOString() : null,
      createdAt: rr.createdAt ? rr.createdAt.toISOString?.() ?? (rr.createdAt as any) : (rr as any).createdAt,
      updatedAt: (rr as any).updatedAt ? (rr as any).updatedAt.toISOString?.() ?? (rr as any).updatedAt : (rr as any).createdAt,
      recyclingRequest: {
        id: rr.id,
        trackingCode: rr.trackingCode,
        deviceName: rr.deviceName,
        deviceType: rr.deviceType,
        manufacturer: rr.manufacturer,
        scheduledDate: rr.scheduledDate,
        scheduledTime: rr.scheduledTime,
        status: rr.status,
      },
      user: (rr as any).user
        ? {
            id: (rr as any).user?.id,
            email: (rr as any).user?.email,
            name: (rr as any).user?.name,
          }
        : undefined,
    };
  }
}

