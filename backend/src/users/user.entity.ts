import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CollectionPoint } from '../collection-points/collection-point.entity';

/** Vai trò tài khoản trong hệ thống */
export enum UserRole {
  /** Người dùng ứng dụng (mặc định) */
  USER = 'USER',
  /** Quản trị tổng: quản lý admin cửa hàng, bài đăng, xem toàn bộ đơn */
  SUPER_ADMIN = 'SUPER_ADMIN',
  /** Admin cửa hàng: chỉ xử lý đơn tại điểm thu gom được gán */
  STORE_ADMIN = 'STORE_ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string; // Hashed password

  @Column()
  name: string;

  @Column({ default: 0 })
  points: number;

  /** varchar để tránh vướng đổi PostgreSQL enum khi đổi giá trị */
  @Column({ type: 'varchar', length: 32, default: UserRole.USER })
  role: UserRole;

  @ManyToOne(() => CollectionPoint, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'collectionPointId' })
  collectionPoint?: CollectionPoint | null;

  @Column({ nullable: true })
  collectionPointId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
