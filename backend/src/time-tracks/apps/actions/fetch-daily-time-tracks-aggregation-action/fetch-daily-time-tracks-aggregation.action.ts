import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { FetchDailyTimeTracksAggregationSwagger } from './fetch-daily-time-tracks-aggregation.swagger';
import { TimeTrackWithNoteNamesResponder } from './time-track-with-note-names.responder';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchDailyTimeTracksAction {
  constructor(
    private readonly timeTrackService: TimeTrackService,
    private readonly timeTrackWithNoteNamesResponder: TimeTrackWithNoteNamesResponder
  ) {}

  @Get('daily')
  @ProtectedAction(FetchDailyTimeTracksAggregationSwagger)
  async apply(@Query('date') date?: string, @GetAuthUser() user?: AuthUser) {
    return await this.timeTrackWithNoteNamesResponder.apply(
      await this.timeTrackService.getDailyTimeTracksAggregation({
        user,
        date,
      })
    );
  }
}
