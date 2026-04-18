import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequestsService } from './return-requests.service';
import { ReturnRequestsController } from './return-requests.controller';
import { RecyclingRequest } from '../recycling-requests/recycling-request.entity';
import { WarehouseItem } from '../warehouse/warehouse-item.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RecyclingRequest, WarehouseItem]), UsersModule],
  controllers: [ReturnRequestsController],
  providers: [ReturnRequestsService],
})
export class ReturnRequestsModule {}

