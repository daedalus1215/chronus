import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { NoteAggregator } from '../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackCommand } from '../commands/create-time-track.command';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';
import { CreateTimeTrackTransactionScript } from '../transaction-scripts/create-time-track.transaction.script';

@Injectable()
export class TimeTrackService {
  constructor(
    private readonly createTimeTrackTS: CreateTimeTrackTransactionScript,
    private readonly noteAggregator: NoteAggregator,
    private readonly timeTrackRepository: TimeTrackRepository
  ) {}

  async createTimeTrack(command: CreateTimeTrackCommand) {
    // Verify note ownership
    const hasAccess = await this.noteAggregator.belongsToUser(command);
    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to access this note');
    }

    // Business Rule Validations
    await this.validateTimeEntry(command);

    // Pass both command and userId to transaction script
    return this.createTimeTrackTS.apply(command, userId);
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
      userId: command.userId,
      date: command.date,
      startTime: command.startTime,
      durationMinutes: command.durationMinutes
    });

    if (existingEntries.length > 0) {
      throw new BadRequestException('Time entry overlaps with existing entries');
    }

    // Check daily limit
    const dailyTotal = await this.timeTrackRepository.getDailyTotal(
      command.userId,
      command.date
    );

    if (dailyTotal + command.durationMinutes > 24 * 60) {
      throw new BadRequestException('Daily time tracking limit exceeded');
    }
  }
} 