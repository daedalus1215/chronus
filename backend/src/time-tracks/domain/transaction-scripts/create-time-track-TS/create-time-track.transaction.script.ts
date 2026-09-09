import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { CreateTimeTrackCommand } from './create-time-track.command';

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(command: CreateTimeTrackCommand): Promise<{
    id: number;
    userId: number;
    noteId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return this.timeTrackRepository.create({
      ...command,
      userId: command.user.userId,
      date: command.date,
    });
  }
}
