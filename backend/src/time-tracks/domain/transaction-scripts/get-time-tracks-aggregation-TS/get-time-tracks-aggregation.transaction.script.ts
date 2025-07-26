import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetTimeTracksAggregationCommand } from './get-time-tracks-aggregation.command';
import { TimeTrackAggregationResponseDto } from '../../../apps/dtos/responses/time-track-aggregation.response.dto';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';

type TimeTrackAggregation = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

@Injectable()
export class GetTimeTracksAggregationTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async apply(command: GetTimeTracksAggregationCommand): Promise<TimeTrackAggregationResponseDto[]> {
    const date = command.date || new Date().toISOString().split('T')[0];

    const aggregations = await this.timeTrackRepository.getTimeTracksAggregation(
      command.user.userId,
      date
    );

    const aggregationsWithNoteTitles = await Promise.all(
      aggregations.map(async (aggregation) => {
        const noteReference = await this.noteAggregator.getReference(
          aggregation.noteId,
          command.user.userId
        );

        return new TimeTrackAggregationResponseDto({
          noteId: aggregation.noteId,
          noteTitle: noteReference.name,
          totalTimeMinutes: aggregation.totalTimeMinutes,
          dailyTimeMinutes: aggregation.dailyTimeMinutes,
          mostRecentStartTime: aggregation.mostRecentStartTime,
          mostRecentDate: aggregation.mostRecentDate,
        });
      })
    );

    return aggregationsWithNoteTitles.sort((a, b) => {
      // Sort by most recent date first, then by most recent time
      const dateComparison = new Date(b.mostRecentDate).getTime() - new Date(a.mostRecentDate).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      return b.mostRecentStartTime.localeCompare(a.mostRecentStartTime);
    });
  }
} 