import { TimeTrackRepository } from "src/time-tracks/infra/repositories/time-track.repository";
import { Injectable } from "@nestjs/common";
import { CreateTimeTrackCommand } from "./create-time-track-TS/create-time-track.command";
import { TimeTrackResponseDto } from "../../apps/dtos/responses/time-track.response.dto";

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand): Promise<TimeTrackResponseDto> {
    const timeTrack = await this.timeTrackRepository.create({
      ...command,
      userId: command.user.userId,
      date: command.date
    });
    
    return new TimeTrackResponseDto(timeTrack);
  }
} 