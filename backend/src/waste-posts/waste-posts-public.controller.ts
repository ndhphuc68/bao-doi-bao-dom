import { Controller, Get, Param } from '@nestjs/common';
import { WastePostsService } from './waste-posts.service';

/** Đọc bài đăng rác thải điện tử đã xuất bản — cho app user. */
@Controller('waste-posts')
export class WastePostsPublicController {
  constructor(private readonly service: WastePostsService) {}

  @Get()
  listPublished() {
    return this.service.listPublished();
  }

  @Get(':id')
  getPublished(@Param('id') id: string) {
    return this.service.getPublished(id);
  }
}
