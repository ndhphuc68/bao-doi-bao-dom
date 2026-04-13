import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionPoint } from './collection-point.entity';

@Injectable()
export class CollectionPointsService implements OnModuleInit {
  constructor(
    @InjectRepository(CollectionPoint)
    private cpRepository: Repository<CollectionPoint>,
  ) {}

  async onModuleInit() {
    const count = await this.cpRepository.count();
    if (count === 0) {
      await this.cpRepository.save([
        { name: 'FPT Shop Điện Biên Phủ', address: '16 Thanh Khê Đông, Đà Nẵng', latitude: 16.065, longitude: 108.188, distanceText: '1.2km', openHours: '08:00 - 22:00' },
        { name: 'Thế Giới Di Động', address: '121 Tôn Đức Thắng, Đà Nẵng', latitude: 16.059, longitude: 108.179, distanceText: '2.5km', openHours: '08:00 - 21:00' },
      ]);
    }
  }

  async findAll(): Promise<CollectionPoint[]> {
    return this.cpRepository.find();
  }

  async findOne(id: string): Promise<CollectionPoint | null> {
    return this.cpRepository.findOneBy({ id });
  }
}
