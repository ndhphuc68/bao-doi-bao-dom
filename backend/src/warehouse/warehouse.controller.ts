import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import type { AdminCreateWarehouseShipmentBody } from './warehouse.service';
import { WarehouseService } from './warehouse.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get('admin/warehouse/shipments')
  @UseGuards(AdminAccessGuard)
  adminListShipments() {
    return this.service.adminListShipments();
  }

  @Post('admin/warehouse/shipments')
  @UseGuards(AdminAccessGuard)
  adminCreateShipment(
    @Req() req: { user: { userId: string } },
    @Body() body: AdminCreateWarehouseShipmentBody,
  ) {
    return this.service.adminCreateShipment(req.user.userId, body);
  }

  @Get('admin/warehouse/shipments/:shipmentId')
  @UseGuards(AdminAccessGuard)
  adminGetShipment(@Param('shipmentId') shipmentId: string) {
    return this.service.adminGetShipment(shipmentId);
  }

  @Get('admin/warehouse')
  @UseGuards(AdminAccessGuard)
  adminList(
    @Query('q') q?: string,
    @Query('availableOnly') availableOnly?: string,
  ) {
    return this.service.adminList({
      q,
      availableOnly: availableOnly === '1' || availableOnly === 'true',
    });
  }

  @Get('admin/warehouse/:id')
  @UseGuards(AdminAccessGuard)
  adminGet(@Param('id') id: string) {
    return this.service.adminGet(id);
  }
}
