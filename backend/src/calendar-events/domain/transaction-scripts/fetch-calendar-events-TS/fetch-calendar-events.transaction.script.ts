import { Injectable } from '@nestjs/common';
import { CalendarEventRepository } from '../../../infra/repositories/calendar-event.repository';
import { FetchCalendarEventsCommand } from './fetch-calendar-events.command';
import { CalendarEvent } from '../../entities/calendar-event.entity';

/**
 * Transaction script for fetching calendar events within a date range.
 * Encapsulates all business logic for retrieving calendar events.
 */
@Injectable()
export class FetchCalendarEventsTransactionScript {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
  ) {}

  /**
   * Fetch calendar events for a user within a specified date range.
   * Validates date range and ensures user can only access their own events.
   */
  async apply(
    command: FetchCalendarEventsCommand,
  ): Promise<CalendarEvent[]> {
    if (command.startDate > command.endDate) {
      throw new Error('Start date must be before end date');
    }
    const dateRangeDays =
      (command.endDate.getTime() - command.startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    if (dateRangeDays > 365) {
      throw new Error('Date range cannot exceed 1 year');
    }
    if (command.userId !== command.user.userId) {
      throw new Error('Unauthorized: Cannot access other users events');
    }
    return await this.calendarEventRepository.findByDateRange(
      command.userId,
      command.startDate,
      command.endDate,
    );
  }
}

