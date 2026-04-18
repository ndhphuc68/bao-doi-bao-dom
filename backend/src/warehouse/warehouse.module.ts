import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseItem } from './warehouse-item.entity';
import { WarehouseShipment } from './warehouse-shipment.entity';
import { WarehouseShipmentItem } from './warehouse-shipment-item.entity';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WarehouseItem,
      WarehouseShipment,
      WarehouseShipmentItem,
    ]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
})
export class WarehouseModule {}

