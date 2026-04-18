import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import { resolveAdminListScope } from '../common/admin-scope.util';
import { RecyclingRequestsService } from './recycling-requests.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class AdminStatsController {
  constructor(private readonly recyclingRequestsService: RecyclingRequestsService) {}

  @Get('admin/stats/recycling')
  @UseGuards(AdminAccessGuard)
  recyclingDashboard(
    @Request()
    req: { user?: { role?: string; collectionPointId?: string | null } },
    @Query('collectionPointId') collectionPointId?: string,
  ) {
    const scope = resolveAdminListScope(req, collectionPointId);
    return this.recyclingRequestsService.getRecyclingDashboardStats(scope);
  }
}
