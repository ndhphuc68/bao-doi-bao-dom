import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { UsersModule } from '../users/users.module';
import { RecyclingRequestsModule } from '../recycling-requests/recycling-requests.module';

@Module({
  imports: [UsersModule, RecyclingRequestsModule],
  controllers: [CommunityController],
})
export class CommunityModule {}
