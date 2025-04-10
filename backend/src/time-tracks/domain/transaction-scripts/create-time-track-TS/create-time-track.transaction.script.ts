import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { CreateTimeTrackCommand } from './create-time-track.command';

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand) {
    return await this.timeTrackRepository.create({
      ...command,
      date: new Date(command.date)
    });
  }
} 