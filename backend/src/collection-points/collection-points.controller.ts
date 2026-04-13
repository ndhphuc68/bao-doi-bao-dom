import { Controller, Get, Param } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';

@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly collectionPointsService: CollectionPointsService) {}

  @Get()
  findAll() {
    return this.collectionPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionPointsService.findOne(id);
  }
}
