import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';
import { TimeTrackWriterPort } from '../../../note-transfer/domain/ports/time-track-writer.port';

export type TimeTrackProjection = {
  date: string;
  startTime: string;
  durationMinutes: number;
};

/**
 * Aggregator for time tracks - provides cross-domain read and write operations.
 */
@Injectable()
export class TimeTracksAggregator implements TimeTrackWriterPort {
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

  // TimeTrackWriterPort implementation
  async bulkCreate(
    noteId: number,
    userId: number,
    logs: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
      note?: string;
    }>
  ): Promise<void> {
    for (const log of logs) {
      await this.timeTrackRepository.create({
        noteId,
        userId,
        date: log.date,
        startTime: log.startTime,
        durationMinutes: log.durationMinutes,
        note: log.note ?? null,
      });
    }
  }
}
