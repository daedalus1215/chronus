import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { GetTimeTracksByNoteIdSwagger } from './get-time-tracks-by-note-id.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetTimeTracksByNoteIdAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('note/:noteId')
  @ProtectedAction(GetTimeTracksByNoteIdSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() user: AuthUser
  ) {
    return this.timeTrackService.getNoteTimeTracks({
      noteId,
      user: user,
    });
  }
}
