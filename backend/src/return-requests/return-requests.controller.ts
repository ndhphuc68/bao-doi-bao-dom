import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import { ReturnRequestsService } from './return-requests.service';
import { ReturnRequestStatus } from './return-request.entity';
import { resolveAdminListScope, resolveAdminScope } from '../common/admin-scope.util';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class ReturnRequestsController {
  constructor(private readonly service: ReturnRequestsService) {}

  @Post('return-requests')
  create(
    @Request() req,
    @Body() body: { recyclingRequestId: string; reason?: string },
  ) {
    return this.service.createForUser(req.user.userId, body);
  }

  @Get('return-requests')
  listMine(@Request() req) {
    return this.service.listForUser(req.user.userId);
  }

  @Patch('return-requests/:id/cancel')
  cancelMine(@Request() req, @Param('id') id: string) {
    return this.service.cancelForUser(req.user.userId, id);
  }

  @Get('admin/return-requests')
  @UseGuards(AdminAccessGuard)
  adminList(
    @Request() req,
    @Query('status') status?: ReturnRequestStatus,
    @Query('q') q?: string,
    @Query('deviceType') deviceType?: string,
    /** Ngày tạo đơn (theo giờ Việt Nam), định dạng YYYY-MM-DD */
    @Query('date') date?: string,
    @Query('collectionPointId') collectionPointId?: string,
  ) {
    const s = resolveAdminListScope(req, collectionPointId);
    return this.service.adminList({
      status,
      q,
      deviceType,
      date,
      collectionPointId: s.scopeAll ? undefined : s.collectionPointId,
      scopeAll: s.scopeAll,
    });
  }

  @Get('admin/return-requests/:id')
  @UseGuards(AdminAccessGuard)
  adminGet(@Request() req, @Param('id') id: string) {
    const s = resolveAdminScope(req);
    return this.service.adminGet(id, {
      collectionPointId: s.scopeAll ? undefined : s.collectionPointId,
      scopeAll: s.scopeAll,
    });
  }

  @Patch('admin/return-requests/:id/status')
  @UseGuards(AdminAccessGuard)
  adminUpdateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: ReturnRequestStatus; adminNote?: string },
  ) {
    const s = resolveAdminScope(req);
    return this.service.adminUpdateStatus(req.user.userId, id, body, {
      collectionPointId: s.scopeAll ? undefined : s.collectionPointId,
      scopeAll: s.scopeAll,
    });
  }
}
