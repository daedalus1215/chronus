import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '../../../api/requests/calendar-events.requests';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const calendarEventKeys = {
  all: ['calendarEvents'] as const,
  lists: () => [...calendarEventKeys.all, 'list'] as const,
  list: (startDate: string, endDate: string) =>
    [...calendarEventKeys.lists(), { startDate, endDate }] as const,
};

export const useCalendarEvents = (
  weekStartDate: Date,
): {
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const startDateStr = format(weekStartDate, 'yyyy-MM-dd');
  const endDateStr = format(weekEndDate, 'yyyy-MM-dd');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: calendarEventKeys.list(startDateStr, endDateStr),
    queryFn: async () => {
      return await fetchCalendarEvents(startDateStr, endDateStr);
    },
    staleTime: 30000,
  });

  return {
    events: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

