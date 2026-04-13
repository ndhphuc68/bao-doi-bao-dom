import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecyclingRequest } from './recycling-request.entity';
import { RecyclingRequestsService } from './recycling-requests.service';
import { RecyclingRequestsController } from './recycling-requests.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RecyclingRequest]), UsersModule],
  controllers: [RecyclingRequestsController],
  providers: [RecyclingRequestsService],
})
export class RecyclingRequestsModule {}
