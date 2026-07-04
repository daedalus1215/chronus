import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';

export type StreakResult = {
  currentStreak: number;
};

@Injectable()
export class GetStreakTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(userId: number, endDate?: string): Promise<StreakResult> {
    const currentStreak = await this.timeTrackRepository.getCurrentStreak(
      userId,
      endDate
    );
    return { currentStreak };
  }
}
