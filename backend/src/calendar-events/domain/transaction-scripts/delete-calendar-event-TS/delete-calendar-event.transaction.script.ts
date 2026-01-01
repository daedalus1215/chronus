import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEventRepository } from '../../../infra/repositories/calendar-event.repository';
import { DeleteCalendarEventCommand } from './delete-calendar-event.command';

/**
 * Transaction script for deleting calendar events.
 * Encapsulates all business logic for deleting calendar events.
 * Handles both one-time events and recurring event instances (now in single table).
 */
@Injectable()
export class DeleteCalendarEventTransactionScript {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
  ) {}

  /**
   * Delete a calendar event (one-time or instance).
   * Validates that the event exists and belongs to the user.
   */
  async apply(command: DeleteCalendarEventCommand): Promise<void> {
    const calendarEvent = await this.calendarEventRepository.findById(
      command.eventId,
      command.user.userId,
    );
    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }

    await this.calendarEventRepository.delete(
      command.eventId,
      command.user.userId,
    );
  }
}

