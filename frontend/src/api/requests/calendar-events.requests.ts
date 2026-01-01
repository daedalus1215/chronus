import api from '../axios.interceptor';
import {
  CalendarEventResponseDto,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  CreateRecurringEventRequest,
  RecurringEventResponseDto,
} from '../dtos/calendar-events.dtos';

export const fetchCalendarEvents = async (
  startDate: string,
  endDate: string,
): Promise<CalendarEventResponseDto[]> => {
  const { data } = await api.get<CalendarEventResponseDto[]>(
    '/calendar-events',
    {
      params: {
        startDate,
        endDate,
      },
    },
  );
  return data;
};

export const createCalendarEvent = async (
  event: CreateCalendarEventRequest,
): Promise<CalendarEventResponseDto> => {
  const { data } = await api.post<CalendarEventResponseDto>(
    '/calendar-events',
    event,
  );
  return data;
};

export const fetchCalendarEvent = async (
  id: number,
): Promise<CalendarEventResponseDto> => {
  const { data } = await api.get<CalendarEventResponseDto>(
    `/calendar-events/${id}`,
  );
  return data;
};

export const updateCalendarEvent = async (
  id: number,
  event: UpdateCalendarEventRequest,
): Promise<CalendarEventResponseDto> => {
  const { data } = await api.put<CalendarEventResponseDto>(
    `/calendar-events/${id}`,
    event,
  );
  return data;
};

export const deleteCalendarEvent = async (
  id: number,
): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(
    `/calendar-events/${id}`,
  );
  return data;
};

export const createRecurringEvent = async (
  event: CreateRecurringEventRequest,
): Promise<RecurringEventResponseDto> => {
  const { data } = await api.post<RecurringEventResponseDto>(
    '/calendar-events/recurring',
    event,
  );
  return data;
};

