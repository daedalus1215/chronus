import { CalendarEvent } from '../../../domain/entities/calendar-event.entity';

export class CalendarEventResponseDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring?: boolean;
  recurringEventId?: number;

  constructor(
    event: CalendarEvent,
    isRecurring?: boolean,
    recurringEventId?: number,
  ) {
    this.id = event.id;
    this.userId = event.userId;
    this.title = event.title;
    this.description = event.description;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
    this.isRecurring = isRecurring;
    this.recurringEventId = recurringEventId;
  }
}

