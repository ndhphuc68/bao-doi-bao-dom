import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserPointLedger } from './user-point-ledger.entity';
import { UsersService } from './users.service';
import { UserPointLedgerService } from './user-point-ledger.service';
import { StoreAdminsController } from './store-admins.controller';
import { CollectionPointsModule } from '../collection-points/collection-points.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPointLedger]), CollectionPointsModule],
  controllers: [StoreAdminsController],
  providers: [UsersService, UserPointLedgerService],
  exports: [UsersService, UserPointLedgerService],
})
export class UsersModule {}
