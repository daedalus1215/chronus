import { Controller, Get } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { GetAuthUser, AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { WeeklyMostActiveNoteResponseDto } from '../../dtos/responses/weekly-most-active-note.response.dto';
import { GetWeeklyMostActiveNoteSwagger } from './get-weekly-most-active-note.swagger';


@Controller('time-tracks')
export class GetWeeklyMostActiveNoteAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/weekly-most-active')
  @ProtectedAction(GetWeeklyMostActiveNoteSwagger)
  async apply(
    @GetAuthUser() user: AuthUser
  ): Promise<WeeklyMostActiveNoteResponseDto> {
    console.log('user', user);
    return await this.timeTrackService.getWeeklyMostActiveNote(user.userId);
  }
}