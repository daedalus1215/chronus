import { Controller, Get } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { NotesByYearResponseDto } from '../../dtos/responses/notes-by-year.response.dto';
import { GetNotesByYearSwagger } from 'src/time-tracks/apps/actions/get-notes-by-year-action/get-notes-by-year.swagger';

@Controller('time-tracks')
export class GetNotesByYearAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/notes-by-year')
  @ProtectedAction(GetNotesByYearSwagger)
  async apply(@GetAuthUser() user: AuthUser): Promise<NotesByYearResponseDto> {
    return await this.timeTrackService.getNotesByYear({ user });
  }
}
