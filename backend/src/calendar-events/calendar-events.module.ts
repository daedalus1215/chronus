import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from './infra/entities/calendar-event.entity';
import { CalendarEventRepository } from './infra/repositories/calendar-event.repository';
import { FetchCalendarEventsTransactionScript } from './domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script';
import { CreateCalendarEventTransactionScript } from './domain/transaction-scripts/create-calendar-event-TS/create-calendar-event.transaction.script';
import { FetchCalendarEventTransactionScript } from './domain/transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.transaction.script';
import { UpdateCalendarEventTransactionScript } from './domain/transaction-scripts/update-calendar-event-TS/update-calendar-event.transaction.script';
import { DeleteCalendarEventTransactionScript } from './domain/transaction-scripts/delete-calendar-event-TS/delete-calendar-event.transaction.script';
import { CalendarEventService } from './domain/services/calendar-event.service';
import { FetchCalendarEventsAction } from './apps/actions/fetch-calendar-events-action/fetch-calendar-events.action';
import { CreateCalendarEventAction } from './apps/actions/create-calendar-event-action/create-calendar-event.action';
import { FetchCalendarEventAction } from './apps/actions/fetch-calendar-event-action/fetch-calendar-event.action';
import { UpdateCalendarEventAction } from './apps/actions/update-calendar-event-action/update-calendar-event.action';
import { DeleteCalendarEventAction } from './apps/actions/delete-calendar-event-action/delete-calendar-event.action';

/**
 * Calendar Events module: encapsulates all calendar event-related logic, actions, and persistence.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CalendarEventEntity])],
  providers: [
    CalendarEventRepository,
    FetchCalendarEventsTransactionScript,
    CreateCalendarEventTransactionScript,
    FetchCalendarEventTransactionScript,
    UpdateCalendarEventTransactionScript,
    DeleteCalendarEventTransactionScript,
    CalendarEventService,
  ],
  controllers: [
    FetchCalendarEventsAction,
    CreateCalendarEventAction,
    FetchCalendarEventAction,
    UpdateCalendarEventAction,
    DeleteCalendarEventAction,
  ],
  exports: [CalendarEventRepository],
})
export class CalendarEventsModule {}

