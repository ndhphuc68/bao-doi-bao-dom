import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RecyclingRequestsService } from './recycling-requests.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('recycling-requests')
@UseGuards(AuthGuard('jwt'))
export class RecyclingRequestsController {
  constructor(private readonly service: RecyclingRequestsService) {}

  @Post()
  create(@Request() req, @Body() data) {
    return this.service.create(req.user.userId, data);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findByUser(req.user.userId);
  }

  @Get('me/:id')
  findMineById(@Request() req, @Param('id') id: string) {
    return this.service.findByIdForUser(req.user.userId, id);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.service.findByTrackingCode(code);
  }
}
