import { Injectable } from '@nestjs/common';
import { RecurringEventRepository } from '../../../infra/repositories/recurring-event.repository';
import { GenerateEventInstancesTransactionScript } from '../generate-event-instances-TS/generate-event-instances.transaction.script';
import { CreateRecurringEventCommand } from './create-recurring-event.command';
import { RecurringEvent } from '../../entities/recurring-event.entity';
import { patternToRruleString } from '../../utils/rrule-pattern.utils';
import { addYears } from 'date-fns';
import { RecurringEventToInfrastructureConverter } from './recurring-event-to-infrastructure.converter';
import { RecurringEventToDomainConverter } from './recurring-event-to-domain.converter';

/**
 * Transaction script for creating recurring events.
 * Encapsulates all business logic for creating recurring events and generating initial instances.
 */
@Injectable()
export class CreateRecurringEventTransactionScript {
  constructor(
    private readonly recurringEventRepository: RecurringEventRepository,
    private readonly generateEventInstancesTransactionScript: GenerateEventInstancesTransactionScript,
    private readonly toInfrastructureConverter: RecurringEventToInfrastructureConverter,
    private readonly toDomainConverter: RecurringEventToDomainConverter,
  ) {}

  /**
   * Create a new recurring event.
   * Validates business rules, creates the recurring event, and generates initial instances.
   */
  async apply(command: CreateRecurringEventCommand): Promise<RecurringEvent> {
    // Generate rrule string
    const rruleString = patternToRruleString(
      command.recurrencePattern,
      command.startDate,
      command.recurrenceEndDate,
      command.noEndDate,
    );

    // Convert domain entity to infrastructure entity
    const domainEvent: Partial<RecurringEvent> = {
      userId: command.user.userId,
      title: command.title.trim(),
      description: command.description?.trim(),
      startDate: command.startDate,
      endDate: command.endDate,
      recurrencePattern: command.recurrencePattern,
      recurrenceEndDate: command.recurrenceEndDate,
      noEndDate: command.noEndDate,
    };
    const infrastructureEntity =
      this.toInfrastructureConverter.apply(domainEvent, rruleString);

    // Save infrastructure entity
    const savedEntity = await this.recurringEventRepository.create(
      infrastructureEntity,
    );

    // Convert back to domain entity
    const recurringEvent = this.toDomainConverter.apply(savedEntity);

    // Generate initial instances
    const rangeStart = command.startDate;
    const rangeEnd = command.noEndDate
      ? addYears(command.startDate, 2)
      : command.recurrenceEndDate || addYears(command.startDate, 2);

    await this.generateEventInstancesTransactionScript.apply(
      recurringEvent,
      rangeStart,
      rangeEnd,
    );

    return recurringEvent;
  }
}

