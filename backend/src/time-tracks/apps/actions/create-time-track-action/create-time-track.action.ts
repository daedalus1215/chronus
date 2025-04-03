import { Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track.service';
import { NoteTimeTrackAction } from 'src/shared-kernel/decorators/note-time-track-action.decorator';
import { CreateTimeTrackSwagger } from './create-time-track.swagger';
import { ProtectedAction } from '../../decorators/protected-action.decorator';
import { CreateTimeTrackCommand } from 'src/time-tracks/domain/transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

//@TODO: We dont need to pass this in, we can set these as a default with no arguments.
@NoteTimeTrackAction({
  path: ':noteId/time-tracks',
  rateLimit: {
    ttl: 30000,  // 30 seconds
    limit: 5     // 5 requests
  }
})
export class CreateTimeTrackAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Post()
  @ProtectedAction(CreateTimeTrackSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: Omit<CreateTimeTrackCommand, 'noteId'>,
    @GetAuthUser('userId') userId: string
  ) {
    const command: CreateTimeTrackCommand = {
      ...dto,
      noteId
    };
    //@TODO: Left off here. We are passing this command around. We actually want to to an app dto and add userId, noteId to an object and refer to that as a command.
    return this.timeTrackService.createTimeTrack(command);
  }
} 