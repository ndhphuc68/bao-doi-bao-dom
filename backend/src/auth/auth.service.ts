import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password || '')) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, name: user.name };
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
    const user = await this.usersService.create({
      email: body.email,
      password: hashedPassword,
      name: body.name || body.email.split('@')[0],
      points: 400, // Eco points added during registration as per UI
    });
    const { password, ...result } = user;
    return this.login(result);
  }
}
