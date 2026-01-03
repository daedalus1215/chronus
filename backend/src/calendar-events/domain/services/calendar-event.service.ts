import { Injectable } from '@nestjs/common';
import { FetchCalendarEventsTransactionScript } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { FetchCalendarEventsCommand } from '../transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.command';
import { CreateCalendarEventTransactionScript } from '../transaction-scripts/create-calendar-event-TS/create-calendar-event.transaction.script';
import { CreateCalendarEventCommand } from '../transaction-scripts/create-calendar-event-TS/create-calendar-event.command';
import { FetchCalendarEventTransactionScript } from '../transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.transaction.script';
import { FetchCalendarEventCommand } from '../transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.command';
import { UpdateCalendarEventTransactionScript } from '../transaction-scripts/update-calendar-event-TS/update-calendar-event.transaction.script';
import { UpdateCalendarEventCommand } from '../transaction-scripts/update-calendar-event-TS/update-calendar-event.command';
import { DeleteCalendarEventTransactionScript } from '../transaction-scripts/delete-calendar-event-TS/delete-calendar-event.transaction.script';
import { DeleteCalendarEventCommand } from '../transaction-scripts/delete-calendar-event-TS/delete-calendar-event.command';
import { GenerateEventInstancesTransactionScript } from '../transaction-scripts/generate-event-instances-TS/generate-event-instances.transaction.script';
import { FetchRecurringEventsTransactionScript } from '../transaction-scripts/fetch-recurring-events-TS/fetch-recurring-events.transaction.script';
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
    private readonly deleteCalendarEventTransactionScript: DeleteCalendarEventTransactionScript,
    private readonly generateEventInstancesTransactionScript: GenerateEventInstancesTransactionScript,
    private readonly fetchRecurringEventsTransactionScript: FetchRecurringEventsTransactionScript,
  ) {}

  /**
   * Fetch calendar events for a user within a date range.
   * Orchestrates instance generation for recurring events before fetching.
   */
  async fetchCalendarEvents(
    command: FetchCalendarEventsCommand,
  ): Promise<CalendarEvent[]> {
    // Fetch recurring events for the user (converted to domain entities)
    const recurringEvents =
      await this.fetchRecurringEventsTransactionScript.apply(command.userId);

    // Generate instances for each recurring event in the date range
    // Instances are generated lazily - the generator will skip any that already exist
    for (const recurringEvent of recurringEvents) {
      await this.generateEventInstancesTransactionScript.apply(
        recurringEvent,
        command.startDate,
        command.endDate,
      );
    }

    // Now fetch all calendar events (one-time and instances) for the user in date range
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

  /**
   * Delete a calendar event.
   */
  async deleteCalendarEvent(command: DeleteCalendarEventCommand): Promise<void> {
    return await this.deleteCalendarEventTransactionScript.apply(command);
  }
}

