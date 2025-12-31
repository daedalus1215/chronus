import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCalendarEvent } from '../../../api/requests/calendar-events.requests';
import {
  CreateCalendarEventRequest,
  CalendarEventResponseDto,
} from '../../../api/dtos/calendar-events.dtos';
import { calendarEventKeys } from './useCalendarEvents';

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      event: CreateCalendarEventRequest,
    ): Promise<CalendarEventResponseDto> => {
      return await createCalendarEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
};

