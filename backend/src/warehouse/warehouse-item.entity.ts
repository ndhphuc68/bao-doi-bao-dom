import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';

@Entity('warehouse_items')
export class WarehouseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Mỗi đơn chỉ nhập kho 1 lần */
  @Column({ unique: true })
  recyclingRequestId: string;

  @ManyToOne(() => RecyclingRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recyclingRequestId' })
  recyclingRequest: RecyclingRequest;

  @Column()
  trackingCode: string;

  @Column()
  deviceType: string;

  @Column()
  deviceName: string;

  @Column({ nullable: true })
  manufacturer?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  condition?: string;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ nullable: true })
  storedByUserId?: string;

  @CreateDateColumn()
  storedAt: Date;
}

