import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionPoint } from './collection-point.entity';
import { CollectionPointsService } from './collection-points.service';
import { CollectionPointsController } from './collection-points.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionPoint])],
  controllers: [CollectionPointsController],
  providers: [CollectionPointsService],
  exports: [CollectionPointsService],
})
export class CollectionPointsModule {}
