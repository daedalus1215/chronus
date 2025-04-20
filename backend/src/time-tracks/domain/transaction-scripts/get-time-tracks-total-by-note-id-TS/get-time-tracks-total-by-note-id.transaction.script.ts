import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetTimeTracksTotalByNoteIdCommand } from './get-time-tracks-total-by-note-id.command';

@Injectable()
export class GetTimeTracksTotalByNoteIdTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: GetTimeTracksTotalByNoteIdCommand) {
    return this.timeTrackRepository.getTotalTimeForNote(
      command.user.userId,
      command.noteId
    );
  }
} 