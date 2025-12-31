import { Injectable } from '@nestjs/common';
import { FetchCalendarEventsTransactionScript } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { FetchCalendarEventsCommand } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.command';
import { CalendarEvent } from '../entities/calendar-event.entity';

/**
 * Calendar Event Service.
 * Orchestrates transaction scripts and provides high-level business operations.
 */
@Injectable()
export class CalendarEventService {
  constructor(
    private readonly fetchCalendarEventsTransactionScript: FetchCalendarEventsTransactionScript,
  ) {}

  /**
   * Fetch calendar events for a user within a date range.
   */
  async fetchCalendarEvents(
    command: FetchCalendarEventsCommand,
  ): Promise<CalendarEvent[]> {
    return await this.fetchCalendarEventsTransactionScript.apply(command);
  }
}

