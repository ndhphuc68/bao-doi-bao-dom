import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { StoreAdminsController } from './store-admins.controller';
import { CollectionPointsModule } from '../collection-points/collection-points.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CollectionPointsModule],
  controllers: [StoreAdminsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
