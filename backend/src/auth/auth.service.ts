import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserPointLedgerService } from '../users/user-point-ledger.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { PointLedgerReason } from '../users/user-point-ledger.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private pointLedgerService: UserPointLedgerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password || '')) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getProfileById(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const { password, ...rest } = user;
    return rest;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role ?? UserRole.USER,
      collectionPointId: user.collectionPointId ?? null,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }

  async register(body: any) {
    const existing = await this.usersService.findOneByEmail(body.email);
    if (existing) {
        throw new UnauthorizedException('Email already exists. Try logging in.');
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const signupPoints = 400;
    const user = await this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(User);
      const u = repo.create({
        email: body.email,
        password: hashedPassword,
        name: body.name || body.email.split('@')[0],
        points: signupPoints,
        role: UserRole.USER,
      });
      await repo.save(u);
      await this.pointLedgerService.appendTransactional(em, {
        userId: u.id,
        amount: signupPoints,
        reason: PointLedgerReason.SIGNUP,
      });
      return u;
    });
    const { password, ...result } = user;
    return this.login(result);
  }

  async getPointLedgerSummary(userId: string) {
    return this.pointLedgerService.getSummaryForUser(userId);
  }
}
