import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { UsersService } from 'src/users/domain/users.service';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { RegisterUserRequestDto } from './dtos/requests/create-user.request.dto';
import { RegisterUserCommand } from '../../domain/transaction-scripts/register-user-TS/register-user.command';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerUserRequestDto: RegisterUserRequestDto,
    @Req() req: Request
  ) {
    const command: RegisterUserCommand = {
      username: registerUserRequestDto.username,
      password: registerUserRequestDto.password,
    };
    return this.usersService.register(command, {
      ip: req.ip ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  }
}
