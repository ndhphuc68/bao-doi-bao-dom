import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequestsService } from './return-requests.service';
import { ReturnRequestsController } from './return-requests.controller';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';
import { WarehouseItem } from '../warehouse/warehouse-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecyclingRequest, WarehouseItem])],
  controllers: [ReturnRequestsController],
  providers: [ReturnRequestsService],
})
export class ReturnRequestsModule {}

