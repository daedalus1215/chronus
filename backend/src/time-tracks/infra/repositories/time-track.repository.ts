import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTrack } from '../../domain/entities/time-track-entity/time-track.entity';
import { getWeekDateRange } from '../../../shared-kernel/utils/date.utils';

@Injectable()
export class TimeTrackRepository {
  constructor(
    @InjectRepository(TimeTrack)
    private readonly repository: Repository<TimeTrack>
  ) {}

  async create(timeTrack: Partial<TimeTrack>): Promise<TimeTrack> {
    const newTimeTrack = this.repository.create(timeTrack);
    return this.repository.save(newTimeTrack);
  }

  async findByUserId(userId: number): Promise<TimeTrack[]> {
    return this.repository.find({
      where: { userId },
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  async findByUserIdAndNoteId(
    userId: number,
    noteId: number
  ): Promise<TimeTrack[]> {
    return this.repository.find({
      where: { userId, noteId },
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  async findById(id: number): Promise<TimeTrack | null> {
    return this.repository.findOne({ where: { id } });
  }

  async getTotalTimeForNote(userId: number, noteId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('timeTrack')
      .select('SUM(timeTrack.durationMinutes)', 'total')
      .where('timeTrack.userId = :userId', { userId })
      .andWhere('timeTrack.noteId = :noteId', { noteId })
      .getRawOne();

    return result?.total || 0;
  }

  async getDailyTotal(userId: number, date: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('timeTrack')
      .select('SUM(timeTrack.durationMinutes)', 'total')
      .where('timeTrack.userId = :userId', { userId })
      .andWhere('timeTrack.date = :date', { date })
      .getRawOne();

    return result?.total || 0;
  }

  async deleteByIdAndUserId(id: number, userId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, userId });
    return result.affected > 0;
  }

  async getDailyTimeTracksAggregation(
    userId: number,
    date: string
  ): Promise<
    Array<{
      noteId: number;
      totalTimeMinutes: number;
      dailyTimeMinutes: number;
      mostRecentStartTime: string;
      mostRecentDate: string;
    }>
  > {
    const aggregations = await this.repository
      .createQueryBuilder('timeTrack')
      .select([
        'timeTrack.noteId as noteId',
        'SUM(timeTrack.durationMinutes) as totalTimeMinutes',
        'SUM(CASE WHEN timeTrack.date = :date THEN timeTrack.durationMinutes ELSE 0 END) as dailyTimeMinutes',
        'MAX(CASE WHEN timeTrack.date = :date THEN timeTrack.startTime END) as mostRecentStartTime',
        'MAX(CASE WHEN timeTrack.date = :date THEN timeTrack.date END) as mostRecentDate',
      ])
      .where('timeTrack.userId = :userId', { userId })
      .groupBy('timeTrack.noteId')
      .having(
        'SUM(CASE WHEN timeTrack.date = :date THEN timeTrack.durationMinutes ELSE 0 END) > 0',
        { date }
      )
      .orderBy('mostRecentDate', 'DESC')
      .addOrderBy('mostRecentStartTime', 'DESC')
      .getRawMany();

    return aggregations.map(agg => ({
      noteId: parseInt(agg.noteId),
      totalTimeMinutes: parseInt(agg.totalTimeMinutes) || 0,
      dailyTimeMinutes: parseInt(agg.dailyTimeMinutes) || 0,
      mostRecentStartTime: agg.mostRecentStartTime,
      mostRecentDate: agg.mostRecentDate,
    }));
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  async getCurrentStreak(userId: number): Promise<number> {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const datesWithActivity = await this.repository
      .createQueryBuilder('timeTrack')
      .select('DISTINCT timeTrack.date', 'date')
      .where('timeTrack.userId = :userId', { userId })
      .orderBy('timeTrack.date', 'DESC')
      .getRawMany();

    if (datesWithActivity.length === 0) {
      return 0;
    }

    const activeDates = new Set(datesWithActivity.map(r => r.date));
    let streak = 0;
    const checkDate = new Date(today);

    const todayStr = formatDate(today);
    if (!activeDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = formatDate(checkDate);
      if (activeDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getWeeklyTrend(
    userId: number,
    days: number = 7
  ): Promise<Array<{ date: string; totalMinutes: number }>> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const result = await this.repository
      .createQueryBuilder('timeTrack')
      .select(['timeTrack.date as date', 'SUM(timeTrack.durationMinutes) as totalMinutes'])
      .where('timeTrack.userId = :userId', { userId })
      .andWhere('timeTrack.date >= :startDate', { startDate: formatDate(startDate) })
      .andWhere('timeTrack.date <= :endDate', { endDate: formatDate(today) })
      .groupBy('timeTrack.date')
      .orderBy('timeTrack.date', 'ASC')
      .getRawMany();

    const dateMap = new Map(
      result.map(r => [r.date, parseInt(r.totalMinutes) || 0])
    );

    const trend: Array<{ date: string; totalMinutes: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      trend.push({
        date: dateStr,
        totalMinutes: dateMap.get(dateStr) || 0,
      });
    }

    return trend;
  }

  async getWeeklyMostActiveNote(userId: number): Promise<{
    noteId: number;
    totalTimeMinutes: number;
    weekStartDate: string;
    weekEndDate: string;
  } | null> {
    // Get the start and end of the current week using local timezone
    const { weekStartDate, weekEndDate } = getWeekDateRange();

    const result = await this.repository
      .createQueryBuilder('time_track')
      .select([
        "time_track.noteId as 'noteId'",
        "SUM(time_track.durationMinutes) as 'totalTimeMinutes'",
        "MIN(time_track.date) as 'weekStartDate'",
        "MAX(time_track.date) as 'weekEndDate'",
      ])
      .where('time_track.userId = :userId', { userId })
      .andWhere('time_track.date BETWEEN :startDate AND :endDate', {
        startDate: weekStartDate,
        endDate: weekEndDate,
      })
      .groupBy('time_track.noteId')
      .orderBy('totalTimeMinutes', 'DESC')
      .limit(1)
      .getRawOne();

    if (!result) return null;

    return {
      noteId: parseInt(result.noteId),
      totalTimeMinutes: parseInt(result.totalTimeMinutes),
      weekStartDate: result.weekStartDate,
      weekEndDate: result.weekEndDate,
    };
  }
}
