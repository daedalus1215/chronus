import api from '../axios.interceptor';
import {
  CalendarEventResponseDto,
  CreateCalendarEventRequest,
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

