import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from './infra/entities/calendar-event.entity';
import { CalendarEventRepository } from './infra/repositories/calendar-event.repository';
import { FetchCalendarEventsTransactionScript } from './domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { CreateCalendarEventTransactionScript } from './domain/transaction-scripts/create-calendar-event-TS/create-calendar-event.transaction.script';
import { CalendarEventService } from './domain/services/calendar-event.service';
import { FetchCalendarEventsAction } from './apps/actions/fetch-calendar-events-action/fetch-calendar-events.action';
import { CreateCalendarEventAction } from './apps/actions/create-calendar-event-action/create-calendar-event.action';

/**
 * Calendar Events module: encapsulates all calendar event-related logic, actions, and persistence.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CalendarEventEntity])],
  providers: [
    CalendarEventRepository,
    FetchCalendarEventsTransactionScript,
    CreateCalendarEventTransactionScript,
    CalendarEventService,
  ],
  controllers: [FetchCalendarEventsAction, CreateCalendarEventAction],
  exports: [CalendarEventRepository],
})
export class CalendarEventsModule {}

