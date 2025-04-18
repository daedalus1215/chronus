import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetNoteTimeTracksCommand } from './get-note-time-tracks.command';

@Injectable()
export class GetNoteTimeTracksTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository  ) {}

  async apply(command: GetNoteTimeTracksCommand) {
    return this.timeTrackRepository.findByUserIdAndNoteId(
      command.user.userId,
      command.noteId
    );
  }
} 