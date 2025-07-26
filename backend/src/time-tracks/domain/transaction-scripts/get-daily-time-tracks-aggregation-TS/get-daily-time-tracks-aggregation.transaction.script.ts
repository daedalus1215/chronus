import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetDailyTimeTracksAggregationCommand } from './get-daily-time-tracks-aggregation.command';

type TimeTrackAggregation = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

@Injectable()
export class GetDailyTimeTracksAggregationTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: GetDailyTimeTracksAggregationCommand): Promise<TimeTrackAggregation[]> {
    const date = command.date || new Date().toISOString().split('T')[0];

    const aggregations = await this.timeTrackRepository.getDailyTimeTracksAggregation(
      command.user.userId,
      date
    );

    return aggregations.sort(this.sortByMostRecentDateAndTime);
  }

  private sortByMostRecentDateAndTime(a: TimeTrackAggregation, b: TimeTrackAggregation) {
    const dateComparison = new Date(b.mostRecentDate).getTime() - new Date(a.mostRecentDate).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    return b.mostRecentStartTime.localeCompare(a.mostRecentStartTime);
  }
} 