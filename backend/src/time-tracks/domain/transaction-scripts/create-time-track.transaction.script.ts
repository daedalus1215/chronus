import { TimeTrackRepository } from "src/time-tracks/infra/repositories/time-track.repository";
import { CreateTimeTrackCommand } from "../commands/create-time-track.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand, userId: string) {
    const timeTrack = await this.timeTrackRepository.create({
      ...command,
      userId
    });

    return timeTrack;
  }
} 