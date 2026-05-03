import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

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

  @Post('admin')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  create(@Body() dto: any) {
    return this.collectionPointsService.create(dto);
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.collectionPointsService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  remove(@Param('id') id: string) {
    return this.collectionPointsService.remove(id);
  }
}
