import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { CreateTimeTrackCommand } from './create-time-track.command';
import { TimeTrackResponseDto } from '../../../apps/dtos/responses/time-track.response.dto';

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand): Promise<TimeTrackResponseDto> {
    const timeTrack = await this.timeTrackRepository.create({
      ...command,
      date: command.date
    });
    
    return new TimeTrackResponseDto(timeTrack);
  }
} 