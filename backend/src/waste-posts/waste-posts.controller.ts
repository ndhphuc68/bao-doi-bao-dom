import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { WastePostsService } from './waste-posts.service';

@Controller()
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
export class WastePostsController {
  constructor(private readonly service: WastePostsService) {}

  @Get('admin/waste-posts')
  list() {
    return this.service.list();
  }

  @Get('admin/waste-posts/:id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post('admin/waste-posts')
  create(
    @Body()
    dto: {
      title: string;
      content: string;
      imageUrl?: string;
      published?: boolean;
    },
  ) {
    return this.service.create({
      title: dto.title,
      body: dto.content,
      imageUrl: dto.imageUrl ?? null,
      published: dto.published === true,
    });
  }

  @Patch('admin/waste-posts/:id')
  update(
    @Param('id') id: string,
    @Body()
    dto: Partial<{ title: string; content: string; imageUrl: string; published: boolean }>,
  ) {
    const patch: Partial<{ title: string; body: string; imageUrl: string; published: boolean }> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.content !== undefined) patch.body = dto.content;
    if (dto.imageUrl !== undefined) patch.imageUrl = dto.imageUrl;
    if (dto.published !== undefined) patch.published = dto.published === true;
    return this.service.update(id, patch);
  }

  @Delete('admin/waste-posts/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
