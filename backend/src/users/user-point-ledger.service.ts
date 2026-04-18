import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { UserPointLedger, PointLedgerReason } from './user-point-ledger.entity';
import { UsersService } from './users.service';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';

export type PointLedgerEntryDto = {
  id: string;
  amount: number;
  reason: PointLedgerReason;
  recyclingRequestId: string | null;
  trackingCode: string | null;
  createdAt: string;
};

export type PointLedgerSummaryDto = {
  points: number;
  entries: PointLedgerEntryDto[];
};

@Injectable()
export class UserPointLedgerService {
  constructor(
    @InjectRepository(UserPointLedger)
    private readonly ledgerRepo: Repository<UserPointLedger>,
    private readonly usersService: UsersService,
  ) {}

  async appendTransactional(
    em: EntityManager,
    entry: {
      userId: string;
      amount: number;
      reason: PointLedgerReason;
      recyclingRequestId?: string | null;
    },
  ): Promise<UserPointLedger> {
    const row = em.create(UserPointLedger, {
      userId: entry.userId,
      amount: entry.amount,
      reason: entry.reason,
      recyclingRequestId: entry.recyclingRequestId ?? null,
    });
    return em.save(row);
  }

  async getSummaryForUser(userId: string): Promise<PointLedgerSummaryDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const rows = await this.ledgerRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 200,
    });

    const reqIds = [...new Set(rows.map((r) => r.recyclingRequestId).filter(Boolean))] as string[];
    let trackingById = new Map<string, string>();
    if (reqIds.length) {
      const rrs = await this.ledgerRepo.manager.find(RecyclingRequest, {
        where: { id: In(reqIds) },
        select: ['id', 'trackingCode'],
      });
      trackingById = new Map(rrs.map((r) => [r.id, r.trackingCode]));
    }

    return {
      points: user.points,
      entries: rows.map((e) => ({
        id: e.id,
        amount: e.amount,
        reason: e.reason,
        recyclingRequestId: e.recyclingRequestId ?? null,
        trackingCode: e.recyclingRequestId
          ? trackingById.get(e.recyclingRequestId) ?? null
          : null,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }
}
