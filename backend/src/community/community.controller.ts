import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { RecyclingRequestsService } from '../recycling-requests/recycling-requests.service';

@Controller('community')
@UseGuards(AuthGuard('jwt'))
export class CommunityController {
  constructor(
    private readonly usersService: UsersService,
    private readonly recyclingRequestsService: RecyclingRequestsService,
  ) {}

  @Get('leaderboard')
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @Get('stats')
  async getStats() {
    // Mock global stats for now based on total recycling requests
    const totalDevices = await this.recyclingRequestsService.countTotalStoredDevices();
    return {
      totalDevices,
      totalUsers: await this.recyclingRequestsService.countUniqueUsers(),
      co2Saved: totalDevices * 1.5, // Mock: 1.5kg CO2 per device
    };
  }

  @Get('feed')
  async getFeed() {
    // Get last 5 completed requests (anonymized)
    const requests = await this.recyclingRequestsService.findRecentCompleted(5);
    return requests.map(r => ({
      id: r.id,
      userName: r.user?.name ? r.user.name.charAt(0) + '***' : 'Ẩn danh',
      deviceType: r.deviceType,
      createdAt: r.createdAt,
    }));
  }
}
