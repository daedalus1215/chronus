import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';

export type WeeklyTrendResult = {
  date: string;
  totalMinutes: number;
};

@Injectable()
export class GetWeeklyTrendTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(userId: number, days: number = 7): Promise<WeeklyTrendResult[]> {
    return this.timeTrackRepository.getWeeklyTrend(userId, days);
  }
}
