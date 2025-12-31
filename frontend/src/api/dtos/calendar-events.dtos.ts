export type CalendarEventResponseDto = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
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

