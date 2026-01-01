import { Injectable, NotFoundException } from '@nestjs/common';
import { RecurringEventRepository } from '../../../infra/repositories/recurring-event.repository';
import { DeleteRecurringEventCommand } from './delete-recurring-event.command';

/**
 * Transaction script for deleting recurring events.
 * Encapsulates all business logic for deleting recurring events.
 * Note: Event instances are automatically deleted via CASCADE foreign key constraint.
 */
@Injectable()
export class DeleteRecurringEventTransactionScript {
  constructor(
    private readonly recurringEventRepository: RecurringEventRepository,
  ) {}

  /**
   * Delete a recurring event.
   * Validates that the recurring event exists and belongs to the user.
   * Event instances are automatically deleted via CASCADE foreign key constraint.
   */
  async apply(command: DeleteRecurringEventCommand): Promise<void> {
    const existingEvent = await this.recurringEventRepository.findById(
      command.recurringEventId,
      command.user.userId,
    );
    if (!existingEvent) {
      throw new NotFoundException('Recurring event not found');
    }
    await this.recurringEventRepository.delete(
      command.recurringEventId,
      command.user.userId,
    );
  }
}

