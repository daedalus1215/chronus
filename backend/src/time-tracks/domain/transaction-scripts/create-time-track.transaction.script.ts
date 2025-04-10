import { TimeTrackRepository } from "src/time-tracks/infra/repositories/time-track.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTimeTrackCommand } from "./create-time-track-TS/create-time-track.command";

@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async apply(command: CreateTimeTrackCommand) {
    await this.validateTimeEntry(command);
    return await this.timeTrackRepository.create({
      ...command,
      userId: command.user.id,
      date: new Date(command.date)
    });
  }


  private async validateTimeEntry(command: CreateTimeTrackCommand) {
    // Validate date is not in the future
    if (new Date(command.date) > new Date()) {
      throw new BadRequestException('Cannot create time entries for future dates');
    }

    // Validate duration
    if (command.durationMinutes <= 0 || command.durationMinutes > 24 * 60) {
      throw new BadRequestException('Duration must be between 1 minute and 24 hours');
    }

    // Check for overlapping time entries
    const existingEntries = await this.timeTrackRepository.findOverlappingEntries({
      userId: command.user.id,
      date: new Date(command.date),
      startTime: command.startTime,
      durationMinutes: command.durationMinutes
    });

    if (existingEntries.length > 0) {
      throw new BadRequestException('Time entry overlaps with existing entries');
    }

    // Check daily limit
    const dailyTotal = await this.timeTrackRepository.getDailyTotal(
      command.user.id,
      new Date(command.date)
    );

    if (dailyTotal + command.durationMinutes > 24 * 60) {
      throw new BadRequestException('Daily time tracking limit exceeded');
    }
  }
} 