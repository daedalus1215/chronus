import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track.service';
import { ProtectedAction } from '../../decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetNoteTimeTracksSwagger } from './get-note-time-tracks.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetNoteTimeTracksAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Get('note/:noteId')
  @ProtectedAction(GetNoteTimeTracksSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() user: AuthUser
  ) {
    return this.timeTrackService.getNoteTimeTracks({
      noteId,
      user: user
    });
  }
} 