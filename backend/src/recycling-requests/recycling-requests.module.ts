import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecyclingRequest } from './recycling-request.entity';
import { RecyclingRequestsService } from './recycling-requests.service';
import { RecyclingRequestsController } from './recycling-requests.controller';
import { AdminRecyclingRequestsController } from './admin-recycling-requests.controller';
import { AdminStatsController } from './admin-stats.controller';
import { UsersModule } from '../users/users.module';
import { WarehouseItem } from '../warehouse/warehouse-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecyclingRequest, WarehouseItem]), UsersModule],
  controllers: [RecyclingRequestsController, AdminRecyclingRequestsController, AdminStatsController],
  providers: [RecyclingRequestsService],
})
export class RecyclingRequestsModule {}
