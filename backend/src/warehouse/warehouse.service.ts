import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WarehouseItem } from './warehouse-item.entity';
import { WarehouseShipment } from './warehouse-shipment.entity';
import { WarehouseShipmentItem } from './warehouse-shipment-item.entity';

export type AdminCreateWarehouseShipmentBody = {
  warehouseItemIds: string[];
  note?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
};

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseItem)
    private readonly repo: Repository<WarehouseItem>,
    @InjectRepository(WarehouseShipment)
    private readonly shipmentRepo: Repository<WarehouseShipment>,
    @InjectRepository(WarehouseShipmentItem)
    private readonly shipmentItemRepo: Repository<WarehouseShipmentItem>,
  ) {}

  async adminList(params: { q?: string; availableOnly?: boolean }) {
    const qb = this.repo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.recyclingRequest', 'rr')
      .orderBy('w.storedAt', 'DESC');

    if (params.q) {
      const q = `%${params.q}%`;
      qb.andWhere(
        '(w.trackingCode ILIKE :q OR w.deviceName ILIKE :q OR w.deviceType ILIKE :q)',
        { q },
      );
    }

    if (params.availableOnly) {
      qb.andWhere(
        'NOT EXISTS (SELECT 1 FROM warehouse_shipment_items wsi WHERE wsi."warehouseItemId" = w.id)',
      );
    }

    const rows = await qb.getMany();
    if (!rows.length) return [];

    const ids = rows.map((r) => r.id);
    const lines = await this.shipmentItemRepo.find({
      where: { warehouseItemId: In(ids) },
      select: ['warehouseItemId', 'shipmentId'],
    });
    const shipmentByItem = new Map(
      lines.map((l) => [l.warehouseItemId, l.shipmentId]),
    );

    return rows.map((w) => ({
      id: w.id,
      recyclingRequestId: w.recyclingRequestId,
      trackingCode: w.trackingCode,
      deviceName: w.deviceName,
      deviceType: w.deviceType,
      manufacturer: w.manufacturer,
      storedAt: w.storedAt,
      storedByUserId: w.storedByUserId,
      shipmentId: shipmentByItem.get(w.id) ?? null,
    }));
  }

  adminGet(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['recyclingRequest'],
    });
  }

  async adminCreateShipment(
    adminUserId: string,
    body: AdminCreateWarehouseShipmentBody,
  ) {
    const uniqIds = [...new Set((body.warehouseItemIds || []).filter(Boolean))];
    if (!uniqIds.length) {
      throw new ConflictException('Chọn ít nhất một thiết bị trong kho');
    }

    return this.repo.manager.transaction(async (em) => {
      const items = await em.find(WarehouseItem, { where: { id: In(uniqIds) } });
      if (items.length !== uniqIds.length) {
        throw new NotFoundException('Một hoặc nhiều bản ghi kho không tồn tại');
      }

      const taken = await em.find(WarehouseShipmentItem, {
        where: { warehouseItemId: In(uniqIds) },
      });
      if (taken.length) {
        throw new ConflictException(
          'Một số thiết bị đã nằm trong đơn gửi hàng khác',
        );
      }

      const shipment = em.create(WarehouseShipment, {
        note: body.note?.trim() || undefined,
        recipientName: body.recipientName?.trim() || undefined,
        recipientPhone: body.recipientPhone?.trim() || undefined,
        recipientAddress: body.recipientAddress?.trim() || undefined,
        status: 'CREATED',
        createdByUserId: adminUserId,
      });
      const saved = await em.save(shipment);

      for (const wi of items) {
        await em.save(
          em.create(WarehouseShipmentItem, {
            shipmentId: saved.id,
            warehouseItemId: wi.id,
          }),
        );
      }

      return this.adminGetShipment(saved.id, em);
    });
  }

  async adminListShipments() {
    const list = await this.shipmentRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
    return list.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      status: s.status,
      note: s.note ?? null,
      recipientName: s.recipientName ?? null,
      recipientPhone: s.recipientPhone ?? null,
      recipientAddress: s.recipientAddress ?? null,
      itemCount: s.items?.length ?? 0,
    }));
  }

  async adminGetShipment(
    id: string,
    em?: import('typeorm').EntityManager,
  ) {
    const mgr = em ?? this.repo.manager;
    const s = await mgr.findOne(WarehouseShipment, {
      where: { id },
      relations: [
        'items',
        'items.warehouseItem',
        'items.warehouseItem.recyclingRequest',
      ],
    });
    if (!s) throw new NotFoundException('Không tìm thấy đơn gửi hàng');

    return {
      id: s.id,
      createdAt: s.createdAt,
      status: s.status,
      note: s.note ?? null,
      recipientName: s.recipientName ?? null,
      recipientPhone: s.recipientPhone ?? null,
      recipientAddress: s.recipientAddress ?? null,
      createdByUserId: s.createdByUserId ?? null,
      items: (s.items || []).map((line) => {
        const w = line.warehouseItem;
        return {
          lineId: line.id,
          warehouseItemId: w?.id,
          trackingCode: w?.trackingCode,
          deviceName: w?.deviceName,
          deviceType: w?.deviceType,
          manufacturer: w?.manufacturer,
          recyclingRequestId: w?.recyclingRequestId,
        };
      }),
    };
  }
}
