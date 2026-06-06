import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTrackWriterPort } from '../../../note-transfer/domain/ports/time-track-writer.port';
import { TimeTrack } from '../../domain/entities/time-track-entity/time-track.entity';

/**
 * Adapter that implements TimeTrackWriterPort using TimeTrackRepository.
 */
@Injectable()
export class TimeTrackWriterAdapter implements TimeTrackWriterPort {
  constructor(
    @InjectRepository(TimeTrack)
    private readonly timeTrackRepository: Repository<TimeTrack>
  ) {}

  async bulkCreate(
    noteId: number,
    userId: number,
    logs: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
    }>
  ): Promise<void> {
    const timeTracks = logs.map(log => {
      const timeTrack = new TimeTrack();
      timeTrack.noteId = noteId;
      timeTrack.userId = userId;
      timeTrack.date = log.date;
      timeTrack.startTime = log.startTime;
      timeTrack.durationMinutes = log.durationMinutes;
      return timeTrack;
    });

    await this.timeTrackRepository.save(timeTracks);
  }
}