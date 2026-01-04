import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetNoteTimeTracksCommand } from './get-note-time-tracks.command';
import { TimeTrackResponseDto } from '../../../apps/dtos/responses/time-track.response.dto';

@Injectable()
export class GetNoteTimeTracksTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(
    command: GetNoteTimeTracksCommand
  ): Promise<TimeTrackResponseDto[]> {
    const timeTracks = await this.timeTrackRepository.findByUserIdAndNoteId(
      command.user.userId,
      command.noteId
    );

    return timeTracks.map(timeTrack => new TimeTrackResponseDto(timeTrack));
  }
}
