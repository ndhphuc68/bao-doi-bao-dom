import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WastePost } from './waste-post.entity';

@Injectable()
export class WastePostsService {
  constructor(
    @InjectRepository(WastePost)
    private readonly repo: Repository<WastePost>,
  ) {}

  /** Chỉ cho xuất bản khi đủ tiêu đề, nội dung và ảnh đại diện. */
  private assertCanPublish(p: {
    title?: string;
    body?: string;
    imageUrl?: string | null;
    published?: boolean;
  }) {
    if (!p.published) return;
    const title = (p.title ?? '').trim();
    const body = (p.body ?? '').trim();
    const img = (p.imageUrl ?? '').trim();
    if (!title || !body) {
      throw new BadRequestException('Cần tiêu đề và nội dung để xuất bản.');
    }
    if (!img) {
      throw new BadRequestException('Cần ảnh đại diện để xuất bản.');
    }
  }

  list() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /** Bài đã xuất bản — dùng cho app người dùng (không cần đăng nhập). */
  listPublished() {
    return this.repo.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
  }

  async get(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Post not found');
    return row;
  }

  async getPublished(id: string) {
    const row = await this.repo.findOne({ where: { id, published: true } });
    if (!row) throw new NotFoundException('Post not found');
    return row;
  }

  create(data: Partial<WastePost>) {
    this.assertCanPublish(data);
    const row = this.repo.create(data);
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<WastePost>) {
    const row = await this.get(id);
    const merged: WastePost = Object.assign(row, data);
    this.assertCanPublish({
      title: merged.title,
      body: merged.body,
      imageUrl: merged.imageUrl,
      published: merged.published,
    });
    return this.repo.save(merged);
  }

  async remove(id: string) {
    const row = await this.get(id);
    await this.repo.remove(row);
    return { ok: true };
  }
}
