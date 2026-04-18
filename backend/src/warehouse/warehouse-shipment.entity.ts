import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WarehouseShipmentItem } from './warehouse-shipment-item.entity';

/** Phiếu xuất / đơn gửi hàng từ kho. */
@Entity('warehouse_shipments')
export class WarehouseShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ nullable: true })
  recipientName?: string;

  @Column({ nullable: true })
  recipientPhone?: string;

  @Column({ type: 'text', nullable: true })
  recipientAddress?: string;

  /** CREATED: đã lập phiếu; DISPATCHED: đã giao vận chuyển; CANCELLED: huỷ */
  @Column({ type: 'varchar', length: 24, default: 'CREATED' })
  status: string;

  @Column({ nullable: true })
  createdByUserId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => WarehouseShipmentItem, (i) => i.shipment, { cascade: true })
  items: WarehouseShipmentItem[];
}
