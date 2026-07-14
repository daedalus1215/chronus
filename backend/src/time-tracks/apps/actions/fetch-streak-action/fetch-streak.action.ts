import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { StreakResponseDto } from '../../dtos/responses/streak.response.dto';
import { FetchStreakSwagger } from './fetch-streak.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchStreakAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/streak')
  @ProtectedAction(FetchStreakSwagger)
  async apply(
    @GetAuthUser() user: AuthUser,
    @Query('date') date?: string
  ): Promise<StreakResponseDto> {
    return await this.timeTrackService.getStreak(user.userId, date);
  }
}
