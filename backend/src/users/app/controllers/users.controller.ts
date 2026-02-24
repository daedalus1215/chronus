import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from 'src/users/domain/users.service';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { RegisterUserRequestDto } from './dtos/requests/create-user.request.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserRequestDto: RegisterUserRequestDto) {
    const defaultAllow =
      process.env.NODE_ENV === 'production' ? 'false' : 'true';
    const allowRegistration = this.configService.get<string>(
      'ALLOW_REGISTRATION',
      defaultAllow
    );
    if (allowRegistration !== 'true') {
      throw new ForbiddenException('Registration is disabled');
    }
    const user = await this.usersService.createUser(registerUserRequestDto);
    return user;
  }
}
