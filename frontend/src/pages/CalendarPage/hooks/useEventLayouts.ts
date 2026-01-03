import { useMemo } from 'react';
import { eachDayOfInterval, endOfWeek } from 'date-fns';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';
import {
  getEventsForDay,
  getEventSlotRange,
  findOverlapGroups,
} from '../utils/event-layout.utils';

export type EventLayout = {
  event: CalendarEventResponseDto;
  columnIndex: number;
  columnCount: number;
  startSlot: number;
  endSlot: number;
  startOffset: number;
  duration: number;
};

export type EventLayoutMap = Map<number, EventLayout>;

/**
 * Calculate layout positions for events on a specific day.
 * Groups overlapping events and assigns column positions.
 */
const calculateEventLayouts = (
  events: CalendarEventResponseDto[],
  day: Date,
): EventLayoutMap => {
  const dayEvents = getEventsForDay(events, day);
  const layoutMap = new Map<number, EventLayout>();
  if (dayEvents.length === 0) {
    return layoutMap;
  }
  const groups = findOverlapGroups(dayEvents, day);
  for (const group of groups) {
    const columnCount = group.length;
    group.forEach((event, index) => {
      const { startSlot, endSlot } = getEventSlotRange(event, day);
      const duration = endSlot - startSlot;
      const startOffset = startSlot % 1;
      layoutMap.set(event.id, {
        event,
        columnIndex: index,
        columnCount,
        startSlot: Math.floor(startSlot),
        endSlot: Math.ceil(endSlot),
        startOffset,
        duration,
      });
    });
  }
  return layoutMap;
};

/**
 * Hook to calculate event layouts for all days in a date range.
 * Memoized to avoid recalculating on every render.
 *
 * @param startDate - The start date of the range (inclusive)
 * @param endDate - The end date of the range (inclusive)
 * @param events - Array of calendar events to layout
 * @returns Map of day ISO strings to event layout maps
 */
export const useEventLayouts = (
  startDate: Date,
  endDate: Date,
  events: CalendarEventResponseDto[],
): Map<string, EventLayoutMap> => {
  return useMemo(() => {
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
    const maps = new Map<string, EventLayoutMap>();
    days.forEach((day) => {
      maps.set(day.toISOString(), calculateEventLayouts(events, day));
    });
    return maps;
  }, [startDate, endDate, events]);
};

