import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repository: Repository<Notification>,
  ) {}

  async create(userId: string, data: { title: string; message: string; type?: NotificationType; relatedId?: string }) {
    const n = this.repository.create({
      userId,
      ...data,
    });
    return this.repository.save(n);
  }

  async findAllForUser(userId: string) {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(userId: string, id: string) {
    await this.repository.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.repository.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    return this.repository.count({ where: { userId, isRead: false } });
  }
}
