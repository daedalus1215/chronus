import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';

@Injectable()
export class GetWeeklyMostActiveNoteTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(userId: number): Promise<{
    noteId: number;
    totalTimeMinutes: number;
    weekStartDate: string;
    weekEndDate: string;
  }> {
    const result =
      await this.timeTrackRepository.getWeeklyMostActiveNote(userId);
    if (!result) {
      return null;
    }

    return {
      noteId: result.noteId,
      totalTimeMinutes: result.totalTimeMinutes,
      weekStartDate: result.weekStartDate,
      weekEndDate: result.weekEndDate,
    };
  }
}
