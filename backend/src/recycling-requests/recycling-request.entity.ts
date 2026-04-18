import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { CollectionPoint } from '../collection-points/collection-point.entity';

export enum DeviceCondition {
  WORKING = 'WORKING',
  NOT_WORKING = 'NOT_WORKING',
}

export enum RequestStatus {
  /** Đã đặt lịch, chờ thu gom */
  PENDING = 'PENDING',
  /** Đã thu gom tại điểm hẹn */
  COMPLETED = 'COMPLETED',
  /** Admin đã xác nhận hoàn trả — thiết bị vào kho lưu trữ */
  STORED = 'STORED',
  CANCELLED = 'CANCELLED',
}

/** Luồng “hoàn trả” gắn trên cùng một đơn thu gom. */
export enum ReturnFlowStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('recycling_requests')
export class RecyclingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  deviceType: string;

  @Column()
  deviceName: string;

  @Column()
  manufacturer: string;

  @Column({ type: 'enum', enum: DeviceCondition, default: DeviceCondition.NOT_WORKING })
  condition: DeviceCondition;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToOne(() => CollectionPoint)
  @JoinColumn({ name: 'collectionPointId' })
  collectionPoint: CollectionPoint;

  @Column()
  collectionPointId: string;

  @Column({ type: 'date' })
  scheduledDate: string;

  @Column()
  scheduledTime: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  /** Trạng thái xử lý hoàn trả (trên chính đơn thu gom). */
  @Column({ type: 'varchar', length: 16, default: ReturnFlowStatus.NONE })
  returnStatus: ReturnFlowStatus;

  /** Lý do hoàn trả do người dùng nhập. */
  @Column({ type: 'text', nullable: true })
  returnReason?: string;

  /** Ghi chú admin khi xác nhận/từ chối. */
  @Column({ type: 'text', nullable: true })
  returnAdminNote?: string;

  @Column({ nullable: true })
  returnDecidedByUserId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  returnDecidedAt?: Date;

  @Column({ unique: true })
  trackingCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
