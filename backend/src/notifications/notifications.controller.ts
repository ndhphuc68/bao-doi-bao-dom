import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@Request() req) {
    return this.service.findAllForUser(req.user.userId);
  }

  @Get('unread-count')
  unreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Request() req, @Param('id') id: string) {
    return this.service.markAsRead(req.user.userId, id);
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.service.markAllAsRead(req.user.userId);
  }
}
