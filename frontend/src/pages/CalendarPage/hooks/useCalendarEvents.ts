import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '../../../api/requests/calendar-events.requests';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';
import { format, startOfWeek, endOfWeek } from 'date-fns';

/**
 * React Query key factory for calendar events.
 * Provides consistent query keys for caching and invalidation.
 */
export const calendarEventKeys = {
  all: ['calendarEvents'] as const,
  lists: () => [...calendarEventKeys.all, 'list'] as const,
  list: (startDate: string, endDate: string) =>
    [...calendarEventKeys.lists(), { startDate, endDate }] as const,
};

/**
 * Hook to fetch calendar events for a given week.
 * Automatically calculates the week's date range and fetches overlapping events.
 *
 * @param weekStartDate - The start date of the week (Monday)
 * @returns Object containing events, loading state, error, and refetch function
 */
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

