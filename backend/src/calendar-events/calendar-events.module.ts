import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from './infra/entities/calendar-event.entity';
import { CalendarEventRepository } from './infra/repositories/calendar-event.repository';
import { FetchCalendarEventsTransactionScript } from './domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { CalendarEventService } from './domain/services/calendar-event.service';
import { FetchCalendarEventsAction } from './apps/actions/fetch-calendar-events-action/fetch-calendar-events.action';

/**
 * Calendar Events module: encapsulates all calendar event-related logic, actions, and persistence.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CalendarEventEntity])],
  providers: [
    CalendarEventRepository,
    FetchCalendarEventsTransactionScript,
    CalendarEventService,
  ],
  controllers: [FetchCalendarEventsAction],
  exports: [CalendarEventRepository],
})
export class CalendarEventsModule {}

