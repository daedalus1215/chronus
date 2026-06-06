import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';

export type TimeTrackProjection = {
  date: string;
  startTime: string;
  durationMinutes: number;
};

/**
 * Aggregator for time tracks - provides cross-domain read operations.
 */
@Injectable()
export class TimeTracksAggregator {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async findByNoteId(
    noteId: number,
    userId: number
  ): Promise<TimeTrackProjection[]> {
    const timeTracks = await this.timeTrackRepository.findByUserIdAndNoteId(
      userId,
      noteId
    );

    return timeTracks.map(tt => ({
      date: tt.date,
      startTime: tt.startTime,
      durationMinutes: tt.durationMinutes,
    }));
  }
}
