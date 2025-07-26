import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetDailyTimeTracksAggregationSwagger } from './get-daily-time-tracks-aggregation.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetDailyTimeTracksAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Get('daily')
  @ProtectedAction(GetDailyTimeTracksAggregationSwagger)
  async apply(
    @Query('date') date?: string,
    @GetAuthUser() user?: AuthUser
  ) {
    return this.timeTrackService.getDailyTimeTracksAggregation({
      user,
      date
    });
  }
} 