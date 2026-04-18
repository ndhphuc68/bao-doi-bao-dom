import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import { resolveAdminScope } from '../common/admin-scope.util';
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
  ) {
    const scope = resolveAdminScope(req);
    return this.recyclingRequestsService.getRecyclingDashboardStats(scope);
  }
}
