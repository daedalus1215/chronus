import { Injectable, NotFoundException } from '@nestjs/common';
import { EventReminderRepository } from '../../../infra/repositories/event-reminder.repository';
import { CalendarEventRepository } from '../../../infra/repositories/calendar-event.repository';
import { UpdateEventReminderCommand } from './update-event-reminder.command';
import { EventReminder } from '../../entities/event-reminder.entity';

/**
 * Transaction script for updating event reminders.
 * Encapsulates all business logic for updating event reminders.
 */
@Injectable()
export class UpdateEventReminderTransactionScript {
  constructor(
    private readonly eventReminderRepository: EventReminderRepository,
    private readonly calendarEventRepository: CalendarEventRepository
  ) {}

  /**
   * Update an event reminder.
   * Validates business rules and updates the reminder.
   */
  async apply(command: UpdateEventReminderCommand): Promise<EventReminder> {
    // Verify the reminder exists
    const existingReminder = await this.eventReminderRepository.findById(
      command.reminderId
    );
    if (!existingReminder) {
      throw new NotFoundException('Event reminder not found');
    }

    // Verify the calendar event belongs to the user
    const event = await this.calendarEventRepository.findById(
      existingReminder.calendarEventId,
      command.user.userId
    );
    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    // Validate reminder minutes is positive
    if (command.reminderMinutes < 0) {
      throw new Error('Reminder minutes must be non-negative');
    }

    // Check if another reminder with same minutes already exists for this event
    const existingReminders = await this.eventReminderRepository.findByEventId(
      existingReminder.calendarEventId
    );
    const duplicateReminder = existingReminders.find(
      r => r.id !== command.reminderId && r.reminderMinutes === command.reminderMinutes
    );
    if (duplicateReminder) {
      throw new Error('Reminder with this timing already exists for this event');
    }

    const updatedReminder = await this.eventReminderRepository.update(
      command.reminderId,
      {
        reminderMinutes: command.reminderMinutes,
      }
    );
    return updatedReminder;
  }
}
