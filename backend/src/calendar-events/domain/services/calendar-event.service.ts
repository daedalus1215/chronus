import { Injectable } from '@nestjs/common';
import { FetchCalendarEventsTransactionScript } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { FetchCalendarEventsCommand } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.command';
import { CreateCalendarEventTransactionScript } from '../transaction-scripts/create-calendar-event-TS/create-calendar-event.transaction.script';
import { CreateCalendarEventCommand } from '../transaction-scripts/create-calendar-event-TS/create-calendar-event.command';
import { FetchCalendarEventTransactionScript } from '../transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.transaction.script';
import { FetchCalendarEventCommand } from '../transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.command';
import { UpdateCalendarEventTransactionScript } from '../transaction-scripts/update-calendar-event-TS/update-calendar-event.transaction.script';
import { UpdateCalendarEventCommand } from '../transaction-scripts/update-calendar-event-TS/update-calendar-event.command';
import { CalendarEvent } from '../entities/calendar-event.entity';

/**
 * Calendar Event Service.
 * Orchestrates transaction scripts and provides high-level business operations.
 */
@Injectable()
export class CalendarEventService {
  constructor(
    private readonly fetchCalendarEventsTransactionScript: FetchCalendarEventsTransactionScript,
    private readonly createCalendarEventTransactionScript: CreateCalendarEventTransactionScript,
    private readonly fetchCalendarEventTransactionScript: FetchCalendarEventTransactionScript,
    private readonly updateCalendarEventTransactionScript: UpdateCalendarEventTransactionScript,
  ) {}

  /**
   * Fetch calendar events for a user within a date range.
   */
  async fetchCalendarEvents(
    command: FetchCalendarEventsCommand,
  ): Promise<CalendarEvent[]> {
    return await this.fetchCalendarEventsTransactionScript.apply(command);
  }

  /**
   * Create a new calendar event.
   */
  async createCalendarEvent(
    command: CreateCalendarEventCommand,
  ): Promise<CalendarEvent> {
    return await this.createCalendarEventTransactionScript.apply(command);
  }

  /**
   * Fetch a calendar event by ID.
   */
  async fetchCalendarEventById(
    command: FetchCalendarEventCommand,
  ): Promise<CalendarEvent> {
    return await this.fetchCalendarEventTransactionScript.apply(command);
  }

  /**
   * Update a calendar event.
   */
  async updateCalendarEvent(
    command: UpdateCalendarEventCommand,
  ): Promise<CalendarEvent> {
    return await this.updateCalendarEventTransactionScript.apply(command);
  }
}

