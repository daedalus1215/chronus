import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvent } from '../../../api/requests/calendar-events.requests';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';
import { calendarEventKeys } from './useCalendarEvents';

export const useCalendarEvent = (id: number | null) => {
  return useQuery({
    queryKey: [...calendarEventKeys.all, 'detail', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Event ID is required');
      }
      return await fetchCalendarEvent(id);
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

