import {
  Controller,
  Request,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getProfileById(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('point-ledger')
  getPointLedger(@Req() req) {
    return this.authService.getPointLedgerSummary(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(
    @Req() req,
    @Body() body: { name?: string; phoneNumber?: string },
  ) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('redeem')
  redeemPoints(
    @Req() req,
    @Body() body: { rewardTitle: string; points: number },
  ) {
    return this.authService.redeemPoints(req.user.userId, body);
  }
}
