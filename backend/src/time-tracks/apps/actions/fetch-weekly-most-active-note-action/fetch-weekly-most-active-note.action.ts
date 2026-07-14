import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { WeeklyMostActiveNoteResponseDto } from '../../dtos/responses/weekly-most-active-note.response.dto';
import { FetchWeeklyMostActiveNoteSwagger } from './fetch-weekly-most-active-note.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchWeeklyMostActiveNoteAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/weekly-most-active')
  @ProtectedAction(FetchWeeklyMostActiveNoteSwagger)
  async apply(
    @GetAuthUser() user: AuthUser,
    @Query('date') date?: string
  ): Promise<WeeklyMostActiveNoteResponseDto> {
    return await this.timeTrackService.getWeeklyMostActiveNote(
      user.userId,
      date
    );
  }
}
