import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecyclingRequest } from './recycling-request.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class RecyclingRequestsService {
  constructor(
    @InjectRepository(RecyclingRequest)
    private requestsRepository: Repository<RecyclingRequest>,
    private usersService: UsersService,
  ) {}

  async create(
    userId: string,
    data: Partial<RecyclingRequest>,
  ): Promise<RecyclingRequest> {
    const trackingCode =
      'ECO-' + Math.floor(1000 + Math.random() * 9000).toString();
    const newRequest = this.requestsRepository.create({
      deviceType: data.deviceType,
      deviceName: data.deviceName,
      manufacturer: data.manufacturer,
      condition: data.condition,
      images: data.images,
      collectionPointId: data.collectionPointId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      userId: userId,
      trackingCode: trackingCode,
    } as import('typeorm').DeepPartial<RecyclingRequest>);
    await this.usersService.addPoints(userId, 100);
    return this.requestsRepository.save(newRequest as any);
  }

  async findByTrackingCode(
    trackingCode: string,
  ): Promise<RecyclingRequest | null> {
    return this.requestsRepository.findOne({
      where: { trackingCode },
      relations: ['collectionPoint'],
    });
  }

  async findByUser(userId: string): Promise<RecyclingRequest[]> {
    return this.requestsRepository.find({
      where: { userId },
      relations: ['collectionPoint'],
    });
  }
}
