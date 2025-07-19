import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeTrack } from '../../domain/entities/time-track-entity/time-track.entity';

type OverlapCheckParams = {
  userId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
}

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
      order: { date: 'DESC', startTime: 'DESC' }
    });
  }

  async findByUserIdAndNoteId(userId: number, noteId: number): Promise<TimeTrack[]> {
    return this.repository.find({
      where: { userId, noteId },
      order: { date: 'DESC', startTime: 'DESC' }
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

  async findOverlappingEntries(params: OverlapCheckParams): Promise<TimeTrack[]> {
    const endTime = this.calculateEndTime(params.startTime, params.durationMinutes);
    const startTime = params.startTime;
    
    return this.repository
      .createQueryBuilder('timeTrack')
      .where('timeTrack.userId = :userId', { userId: params.userId })
      .andWhere('timeTrack.date = :date', { date: params.date })
      .andWhere(
        '(timeTrack.startTime <= :endTime AND ' +
        'time(timeTrack.startTime, \'+\' || timeTrack.durationMinutes || \' minutes\') >= :startTime)',
        { startTime, endTime }
      )
      .getMany();
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

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
} 