import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetTimeTracksByDateRangeCommand } from './get-time-tracks-by-date-range.command';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

@Injectable()
export class GetTimeTracksByDateRangeTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(
    command: GetTimeTracksByDateRangeCommand
  ): Promise<TimeTrack[]> {
    return this.timeTrackRepository.findByUserIdAndDateRange(
      command.userId,
      command.from,
      command.to
    );
  }
}
