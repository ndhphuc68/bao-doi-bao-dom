import { BadRequestException, Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import { resolveAdminScope } from '../common/admin-scope.util';
import { RecyclingRequestsService } from './recycling-requests.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class AdminRecyclingRequestsController {
  constructor(private readonly service: RecyclingRequestsService) {}

  @Get('admin/recycling-requests')
  @UseGuards(AdminAccessGuard)
  adminList(
    @Request() req,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('returnStatus') returnStatus?: string,
    /** Ngày tạo đơn (theo múi +07), YYYY-MM-DD */
    @Query('date') date?: string,
  ) {
    const s = resolveAdminScope(req);
    return this.service.adminList({
      q,
      status,
      returnStatus,
      date,
      collectionPointId: s.scopeAll ? undefined : s.collectionPointId,
      scopeAll: s.scopeAll,
    });
  }

  @Get('admin/recycling-requests/:id')
  @UseGuards(AdminAccessGuard)
  adminGet(@Request() req, @Param('id') id: string) {
    const s = resolveAdminScope(req);
    return this.service.adminGet(id, s);
  }

  @Patch('admin/recycling-requests/:id/decision')
  @UseGuards(AdminAccessGuard)
  adminDecision(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT'; adminNote?: string },
  ) {
    const s = resolveAdminScope(req);
    const d = body?.decision;
    if (d !== 'APPROVE' && d !== 'REJECT') throw new BadRequestException('Invalid decision');
    return this.service.adminDecision(req.user.userId, id, { decision: d, adminNote: body?.adminNote }, s);
  }
}
