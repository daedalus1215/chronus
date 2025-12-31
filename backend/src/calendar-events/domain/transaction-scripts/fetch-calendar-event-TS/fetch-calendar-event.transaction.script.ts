import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEventRepository } from '../../../infra/repositories/calendar-event.repository';
import { FetchCalendarEventCommand } from './fetch-calendar-event.command';
import { CalendarEvent } from '../../entities/calendar-event.entity';

/**
 * Transaction script for fetching a single calendar event by ID.
 * Encapsulates all business logic for fetching calendar events.
 */
@Injectable()
export class FetchCalendarEventTransactionScript {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
  ) {}

  /**
   * Fetch a calendar event by ID for a specific user.
   * Throws NotFoundException if event doesn't exist or doesn't belong to user.
   */
  async apply(command: FetchCalendarEventCommand): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findById(
      command.eventId,
      command.user.userId,
    );
    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }
    return event;
  }
}

