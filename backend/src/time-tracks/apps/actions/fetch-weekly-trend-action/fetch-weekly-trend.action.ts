import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { WeeklyTrendResponseDto } from '../../dtos/responses/weekly-trend.response.dto';
import { FetchWeeklyTrendSwagger } from './fetch-weekly-trend.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchWeeklyTrendAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/weekly-trend')
  @ProtectedAction(FetchWeeklyTrendSwagger)
  async apply(
    @GetAuthUser() user: AuthUser,
    @Query('date') date?: string
  ): Promise<WeeklyTrendResponseDto> {
    return await this.timeTrackService.getWeeklyTrend(user.userId, date);
  }
}
