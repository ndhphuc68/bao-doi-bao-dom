import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PointLedgerReason {
  SIGNUP = 'SIGNUP',
  ORDER_APPROVED = 'ORDER_APPROVED',
}

@Entity('user_point_ledger')
export class UserPointLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('uuid')
  userId: string;

  /** Số điểm cộng (luôn dương trong phiên bản hiện tại). */
  @Column('int')
  amount: number;

  @Column({ type: 'varchar', length: 32 })
  reason: PointLedgerReason;

  @Column({ type: 'uuid', nullable: true })
  recyclingRequestId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
