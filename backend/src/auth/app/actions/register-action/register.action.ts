import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from 'src/users/domain/users.service';
import { RegisterDto } from './dtos/requests/register.dto';

@Controller('auth')
export class RegisterAction {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const defaultAllow =
      process.env.NODE_ENV === 'production' ? 'false' : 'true';
    const allowRegistration = this.configService.get<string>(
      'ALLOW_REGISTRATION',
      defaultAllow
    );
    if (allowRegistration !== 'true') {
      throw new ForbiddenException('Registration is disabled');
    }
    const user = await this.usersService.createUser(registerDto);
    return user;
  }
}
