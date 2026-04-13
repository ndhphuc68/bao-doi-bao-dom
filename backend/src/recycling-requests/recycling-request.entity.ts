import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { CollectionPoint } from '../collection-points/collection-point.entity';

export enum DeviceCondition {
  WORKING = 'WORKING',
  NOT_WORKING = 'NOT_WORKING',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
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

  @Column({ unique: true })
  trackingCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
