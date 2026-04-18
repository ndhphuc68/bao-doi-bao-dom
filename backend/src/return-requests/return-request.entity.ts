import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';
import { User } from '../users/user.entity';

export enum ReturnRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RecyclingRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recyclingRequestId' })
  recyclingRequest: RecyclingRequest;

  @Column()
  recyclingRequestId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  adminNote?: string;

  @Column({ type: 'enum', enum: ReturnRequestStatus, default: ReturnRequestStatus.PENDING })
  status: ReturnRequestStatus;

  @Column({ nullable: true })
  decidedByUserId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

