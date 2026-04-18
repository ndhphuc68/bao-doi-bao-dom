import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WastePost } from './waste-post.entity';
import { WastePostsService } from './waste-posts.service';
import { WastePostsController } from './waste-posts.controller';
import { WastePostsPublicController } from './waste-posts-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WastePost])],
  controllers: [WastePostsController, WastePostsPublicController],
  providers: [WastePostsService],
})
export class WastePostsModule {}
