import { Injectable } from '@nestjs/common';
import { EventInstanceRepository } from '../../../infra/repositories/event-instance.repository';
import { RecurrenceExceptionRepository } from '../../../infra/repositories/recurrence-exception.repository';
import { RecurringEvent } from '../../entities/recurring-event.entity';
import { EventInstance } from '../../entities/event-instance.entity';
import {
  generateInstanceDates,
  patternToRruleString,
} from '../../utils/rrule-pattern.utils';
import { startOfDay, differenceInMinutes } from 'date-fns';

/**
 * Transaction script for generating event instances from a recurring event.
 * Encapsulates all business logic for generating instances based on recurrence patterns.
 */
@Injectable()
export class GenerateEventInstancesTransactionScript {
  constructor(
    private readonly eventInstanceRepository: EventInstanceRepository,
    private readonly recurrenceExceptionRepository: RecurrenceExceptionRepository,
  ) {}

  /**
   * Generate event instances for a recurring event within a date range.
   * Creates EventInstance records for each occurrence.
   *
   * @param recurringEvent - The recurring event to generate instances for
   * @param rangeStart - Start of the date range to generate instances for
   * @param rangeEnd - End of the date range to generate instances for
   * @returns Array of created EventInstance entities
   */
  async apply(
    recurringEvent: RecurringEvent,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<EventInstance[]> {
    // Get exception dates for this recurring event
    const exceptions =
      await this.recurrenceExceptionRepository.findByRecurringEventId(
        recurringEvent.id,
      );
    const exceptionDates = exceptions.map((ex) => ex.exceptionDate);

    // Generate instance dates using rrule
    const instanceStartDates = generateInstanceDates(
      recurringEvent.recurrencePattern,
      recurringEvent.startDate,
      recurringEvent.endDate,
      recurringEvent.recurrenceEndDate,
      recurringEvent.noEndDate,
      exceptionDates,
      rangeStart,
      rangeEnd,
    );

    // Calculate duration from original event
    const durationMinutes = differenceInMinutes(
      recurringEvent.endDate,
      recurringEvent.startDate,
    );

    // Create EventInstance for each generated date
    const instances: EventInstance[] = [];
    for (const instanceStartDate of instanceStartDates) {
      const instanceDate = startOfDay(instanceStartDate);
      const instanceEndDate = new Date(
        instanceStartDate.getTime() + durationMinutes * 60 * 1000,
      );

      const instance = await this.eventInstanceRepository.create({
        recurringEventId: recurringEvent.id,
        instanceDate,
        startDate: instanceStartDate,
        endDate: instanceEndDate,
        isModified: false,
      });

      instances.push(instance);
    }

    return instances;
  }
}

