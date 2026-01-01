export type CalendarEventResponseDto = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  isRecurring?: boolean;
  recurringEventId?: number;
};

export type CreateCalendarEventRequest = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type UpdateCalendarEventRequest = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type RecurrencePatternDto = {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
};

export type CreateRecurringEventRequest = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrencePattern: RecurrencePatternDto;
  recurrenceEndDate?: string;
  noEndDate: boolean;
};

export type RecurringEventResponseDto = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrencePattern: RecurrencePatternDto;
  recurrenceEndDate?: string;
  noEndDate: boolean;
  createdAt: string;
  updatedAt: string;
};

