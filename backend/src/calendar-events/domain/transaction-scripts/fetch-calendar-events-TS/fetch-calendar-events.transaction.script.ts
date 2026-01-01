import { Injectable } from '@nestjs/common';
import { CalendarEventRepository } from '../../../infra/repositories/calendar-event.repository';
import { RecurringEventRepository } from '../../../infra/repositories/recurring-event.repository';
import { FetchCalendarEventsCommand } from './fetch-calendar-events.command';
import { CalendarEvent } from '../../entities/calendar-event.entity';
import { RecurringEventToDomainConverter } from '../create-recurring-event-TS/recurring-event-to-domain.converter';

/**
 * Transaction script for fetching calendar events within a date range.
 * Encapsulates all business logic for retrieving calendar events.
 * Now uses a single table for both one-time events and recurring event instances.
 */
@Injectable()
export class FetchCalendarEventsTransactionScript {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly recurringEventRepository: RecurringEventRepository,
    private readonly recurringEventToDomainConverter: RecurringEventToDomainConverter,
  ) {}

  /**
   * Fetch calendar events for a user within a specified date range.
   * Includes both regular calendar events and instances from recurring events.
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

    // Fetch recurring events for the user (needed for metadata enrichment)
    const recurringEventEntities =
      await this.recurringEventRepository.findByUserId(command.userId);

    // Convert recurring events to domain entities
    const recurringEvents = recurringEventEntities.map((entity) =>
      this.recurringEventToDomainConverter.apply(entity),
    );

    // Fetch all calendar events (one-time and instances) for the user in date range
    // Note: Instance generation is handled by the service layer before calling this script
    const allEvents = await this.calendarEventRepository.findByDateRange(
      command.userId,
      command.startDate,
      command.endDate,
    );

    // Add metadata for response DTO conversion and ensure instances have correct title/description
    const eventsWithMetadata = allEvents.map((event) => {
      const isRecurring = event.recurringEventId !== undefined;
      if (isRecurring) {
        (event as any).__isRecurring = true;
        (event as any).__recurringEventId = event.recurringEventId;
        
        // Use override if present, otherwise use base title/description
        const recurringEvent = recurringEvents.find(
          (re) => re.id === event.recurringEventId,
        );
        if (recurringEvent) {
          event.title = event.titleOverride || recurringEvent.title;
          event.description =
            event.descriptionOverride || recurringEvent.description;
        }
      }
      return event;
    });

    // Sort by start date
    return eventsWithMetadata.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }
}

