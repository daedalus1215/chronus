import { TimeTrackRepository } from "src/time-tracks/infra/repositories/time-track.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTimeTrackCommand } from "./create-time-track-TS/create-time-track.command";
import { TimeTrackResponseDto } from "../../apps/dtos/responses/time-track.response.dto";

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand): Promise<TimeTrackResponseDto> {
    await this.validateTimeEntry(command);
    const timeTrack = await this.timeTrackRepository.create({
      ...command,
      userId: command.user.userId,
      date: command.date
    });
    
    return new TimeTrackResponseDto(timeTrack);
  }


  private async validateTimeEntry(command: CreateTimeTrackCommand) {
    if (command.durationMinutes <= 0 || command.durationMinutes > 24 * 60) {
      throw new BadRequestException('Duration must be between 1 minute and 24 hours');
    }
  }
} 