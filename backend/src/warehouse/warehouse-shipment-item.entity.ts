import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WarehouseShipment } from './warehouse-shipment.entity';
import { WarehouseItem } from './warehouse-item.entity';

/** Một dòng trên phiếu gửi — mỗi bản ghi kho chỉ thuộc tối đa một phiếu. */
@Entity('warehouse_shipment_items')
export class WarehouseShipmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shipmentId: string;

  @ManyToOne(() => WarehouseShipment, (s) => s.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: WarehouseShipment;

  @Column({ unique: true })
  warehouseItemId: string;

  @ManyToOne(() => WarehouseItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseItemId' })
  warehouseItem: WarehouseItem;
}
