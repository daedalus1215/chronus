import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCalendarEvent } from '../../../api/requests/calendar-events.requests';
import {
  UpdateCalendarEventRequest,
  CalendarEventResponseDto,
} from '../../../api/dtos/calendar-events.dtos';
import { calendarEventKeys } from './useCalendarEvents';

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      event,
    }: {
      id: number;
      event: UpdateCalendarEventRequest;
    }): Promise<CalendarEventResponseDto> => {
      return await updateCalendarEvent(id, event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
};

