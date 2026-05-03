import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CollectionPointsService } from '../collection-points/collection-points.service';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { BadRequestException, Delete } from '@nestjs/common';
import { UserPointLedgerService } from './user-point-ledger.service';
import type { User } from './user.entity';

function omitPassword<T extends User>(u: T): Omit<T, 'password'> {
  const { password: _p, ...rest } = u;
  return rest as Omit<T, 'password'>;
}

@Controller()
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
export class AdminsController {
  constructor(
    private readonly users: UsersService,
    private readonly points: CollectionPointsService,
    private readonly ledger: UserPointLedgerService,
  ) {}

  @Get('admin/users')
  async listAllUsers() {
    const rows = await this.users.findAll();
    return rows.map((u) => omitPassword(u));
  }

  @Get('admin/admins')
  async listAdmins() {
    const rows = await this.users.listAdmins();
    return rows.map((u) => omitPassword(u));
  }

  @Post('admin/admins')
  async create(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      collectionPointId?: string | null;
    },
  ) {
    if (!body?.email?.trim() || !body?.password) {
      throw new BadRequestException('email and password are required');
    }
    const cpId = body.collectionPointId?.trim() || null;
    if (cpId) {
      const cp = await this.points.findOne(cpId);
      if (!cp) throw new BadRequestException('Invalid collection point');
    }
    return this.users.createAdmin({
      email: body.email,
      password: body.password,
      name: body.name?.trim() || body.email.split('@')[0],
      collectionPointId: cpId,
    });
  }

  @Patch('admin/admins/:id')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      collectionPointId: string | null;
      role: UserRole;
      name: string;
    }>,
  ) {
    if (body.collectionPointId) {
      const cp = await this.points.findOne(body.collectionPointId);
      if (!cp) throw new BadRequestException('Invalid collection point');
    }
    const patch: Partial<{ collectionPointId: string | null; role: UserRole; name: string }> = {};
    if (body.name != null) patch.name = body.name;
    if (body.collectionPointId !== undefined) patch.collectionPointId = body.collectionPointId;
    if (body.role !== undefined) patch.role = body.role;
    const updated = await this.users.updateAdminUser(id, patch);
    return omitPassword(updated);
  }

  @Get('admin/users/:id/points')
  async getUserPoints(@Param('id') id: string) {
    return this.ledger.getSummaryForUser(id);
  }

  @Patch('admin/users/:id')
  async updateUserInfo(
    @Param('id') id: string,
    @Body() body: { name?: string; phoneNumber?: string },
  ) {
    const patch: any = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.phoneNumber !== undefined) patch.phoneNumber = body.phoneNumber;
    const updated = await this.users.updateAdminUser(id, patch);
    return omitPassword(updated);
  }

  @Delete('admin/users/:id')
  async deleteUser(@Param('id') id: string) {
    await this.users.deleteUser(id);
    return { success: true };
  }
}
