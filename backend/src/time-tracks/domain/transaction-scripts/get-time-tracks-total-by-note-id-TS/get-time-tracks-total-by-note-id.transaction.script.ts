import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetTimeTracksTotalByNoteIdCommand } from './get-time-tracks-total-by-note-id.command';
import { TimeTrackTotalResponseDto } from '../../../apps/dtos/responses/time-track-total.response.dto';

@Injectable()
export class GetTimeTracksTotalByNoteIdTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: GetTimeTracksTotalByNoteIdCommand): Promise<TimeTrackTotalResponseDto> {
    const totalMinutes = await this.timeTrackRepository.getTotalTimeForNote(
      command.user.userId,
      command.noteId
    );
    
    return new TimeTrackTotalResponseDto(totalMinutes);
  }
} 