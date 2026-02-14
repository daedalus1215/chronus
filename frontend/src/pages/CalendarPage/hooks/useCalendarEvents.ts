import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '../../../api/requests/calendar-events.requests';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';
import { format, addDays } from 'date-fns';

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
 * Hook to fetch calendar events for a given date range.
 * Fetches all events that overlap with the specified date range.
 *
 * @param startDate - The start date of the range (inclusive)
 * @param endDate - The end date of the range (inclusive)
 * @returns Object containing events, loading state, error, and refetch function
 */
export const useCalendarEvents = (
  startDate: Date,
  endDate: Date
): {
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(addDays(endDate, 1), 'yyyy-MM-dd');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: calendarEventKeys.list(startDateStr, endDateStr),
    queryFn: async () => {
      const events = await fetchCalendarEvents(startDateStr, endDateStr);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/a1ee2f6c-81f1-40da-a534-f4dab2c41eea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'initial',
          hypothesisId: 'H1_H2',
          location: 'useCalendarEvents.ts:40',
          message: 'Fetched calendar events for range',
          data: {
            startDateStr,
            endDateStr,
            rangeDays: Math.round(
              (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) /
                (24 * 60 * 60 * 1000)
            ),
            totalEvents: events.length,
            recurringEvents: events.filter(e => e.isRecurring).length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return events;
    },
    staleTime: 0, // Always refetch when invalidated to ensure fresh data
  });

  return {
    events: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
