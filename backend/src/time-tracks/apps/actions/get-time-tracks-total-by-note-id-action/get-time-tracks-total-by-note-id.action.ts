import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetTimeTracksTotalByNoteIdSwagger } from './get-time-tracks-total-by-note-id.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetTimeTracksTotalByNoteIdAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Get('note/:noteId/total')
  @ProtectedAction(GetTimeTracksTotalByNoteIdSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() user: AuthUser
  ) {
    return this.timeTrackService.getNoteTimeTracksTotal({
      noteId,
      user
    });
  }
} 