import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward, Today } from '@mui/icons-material';
import {
  format,
  eachDayOfInterval,
  endOfWeek,
  isToday,
  startOfDay,
} from 'date-fns';
import { CalendarEventResponseDto } from '../../../../api/dtos/calendar-events.dtos';
import { EventDetailsModal } from '../EventDetailsModal/EventDetailsModal';
import styles from './CalendarView.module.css';

type CalendarViewProps = {
  weekStartDate: Date;
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

type EventLayout = {
  event: CalendarEventResponseDto;
  columnIndex: number;
  columnCount: number;
  startSlot: number;
  endSlot: number;
  startOffset: number;
  duration: number;
};

type EventLayoutMap = Map<number, EventLayout>;

/**
 * Calendar view component displaying a weekly calendar grid with hourly time slots.
 * Shows events in their respective time slots and days.
 * Supports clicking events to view/edit details.
 *
 * @param props - Component props
 * @param props.weekStartDate - The start date of the week (Monday)
 * @param props.events - Array of calendar events to display
 * @param props.isLoading - Whether events are currently loading
 * @param props.onPreviousWeek - Callback to navigate to previous week
 * @param props.onNextWeek - Callback to navigate to next week
 * @param props.onToday - Callback to navigate to current week
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  weekStartDate,
  events,
  isLoading,
  onPreviousWeek,
  onNextWeek,
  onToday,
}) => {
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStartDate,
    end: weekEndDate,
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    if (calendarGridRef.current) {
      calendarGridRef.current.scrollTop = 0;
    }
  }, [weekStartDate]);

  /**
   * Get all events for a specific day.
   * Includes events that start on that day (even if they span multiple days).
   */
  const getEventsForDay = (day: Date): CalendarEventResponseDto[] => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  /**
   * Calculate the time slot range for an event on a specific day.
   * Returns the start and end slot indices (0-23 for hours, with fractional parts for minutes).
   */
  const getEventSlotRange = (
    event: CalendarEventResponseDto,
    day: Date,
  ): { startSlot: number; endSlot: number } => {
    const dayStart = startOfDay(day);
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const clampedStart = eventStart < dayStart ? dayStart : eventStart;
    const clampedEnd = eventEnd > dayEnd ? dayEnd : eventEnd;
    const startSlot =
      clampedStart.getHours() + clampedStart.getMinutes() / 60;
    const endSlot = clampedEnd.getHours() + clampedEnd.getMinutes() / 60;
    return { startSlot, endSlot };
  };

  /**
   * Check if two events overlap in time.
   */
  const eventsOverlap = (
    event1: CalendarEventResponseDto,
    event2: CalendarEventResponseDto,
    day: Date,
  ): boolean => {
    const range1 = getEventSlotRange(event1, day);
    const range2 = getEventSlotRange(event2, day);
    return (
      range1.startSlot < range2.endSlot && range2.startSlot < range1.endSlot
    );
  };

  /**
   * Find all events that overlap transitively (connected components in overlap graph).
   * Uses union-find approach to group all overlapping events.
   */
  const findOverlapGroups = (
    dayEvents: CalendarEventResponseDto[],
    day: Date,
  ): CalendarEventResponseDto[][] => {
    if (dayEvents.length === 0) {
      return [];
    }
    const parent = new Map<number, number>();
    const find = (id: number): number => {
      if (!parent.has(id)) {
        parent.set(id, id);
      }
      if (parent.get(id) !== id) {
        parent.set(id, find(parent.get(id)!));
      }
      return parent.get(id)!;
    };
    const union = (id1: number, id2: number): void => {
      const root1 = find(id1);
      const root2 = find(id2);
      if (root1 !== root2) {
        parent.set(root1, root2);
      }
    };
    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        if (eventsOverlap(dayEvents[i], dayEvents[j], day)) {
          union(dayEvents[i].id, dayEvents[j].id);
        }
      }
    }
    const groupsMap = new Map<number, CalendarEventResponseDto[]>();
    for (const event of dayEvents) {
      const root = find(event.id);
      if (!groupsMap.has(root)) {
        groupsMap.set(root, []);
      }
      groupsMap.get(root)!.push(event);
    }
    return Array.from(groupsMap.values());
  };

  /**
   * Calculate layout positions for events on a specific day.
   * Groups overlapping events and assigns column positions.
   */
  const calculateEventLayouts = (
    day: Date,
  ): EventLayoutMap => {
    const dayEvents = getEventsForDay(day);
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
   * Calculate layout maps for all days in the week.
   * Memoized to avoid recalculating on every render.
   */
  const dayLayoutMaps = useMemo(() => {
    const maps = new Map<string, EventLayoutMap>();
    const weekDays = eachDayOfInterval({
      start: weekStartDate,
      end: weekEndDate,
    });
    weekDays.forEach((day) => {
      maps.set(day.toISOString(), calculateEventLayouts(day));
    });
    return maps;
  }, [weekStartDate, weekEndDate, events]);

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={styles.calendarView}>
      <Box className={styles.header}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onPreviousWeek}
          variant="outlined"
        >
          Previous
        </Button>
        <Typography variant="h5" className={styles.weekTitle}>
          {format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d, yyyy')}
        </Typography>
        <Box>
          <Button
            startIcon={<Today />}
            onClick={onToday}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Today
          </Button>
          <Button
            endIcon={<ArrowForward />}
            onClick={onNextWeek}
            variant="outlined"
          >
            Next
          </Button>
        </Box>
      </Box>

      <Box className={styles.calendarGrid} ref={calendarGridRef}>
        <Box className={styles.timeColumn}>
          <Box className={styles.timeSlotHeader}></Box>
          {timeSlots.map((hour) => (
            <Box key={hour} className={styles.timeSlot}>
              {hour.toString().padStart(2, '0')}:00
            </Box>
          ))}
        </Box>

        {days.map((day) => {
          const layoutMap = dayLayoutMaps.get(day.toISOString()) || new Map();
          return (
            <Box key={day.toISOString()} className={styles.dayColumn}>
              <Paper
                className={`${styles.dayHeader} ${
                  isToday(day) ? styles.today : ''
                }`}
              >
                <Typography variant="subtitle2">
                  {format(day, 'EEE')}
                </Typography>
                <Typography variant="h6">{format(day, 'd')}</Typography>
              </Paper>
              <Box className={styles.dayContent}>
                {timeSlots.map((hour) => (
                  <Box
                    key={`${day.toISOString()}-${hour}`}
                    className={styles.timeSlotCell}
                  />
                ))}
                {Array.from(layoutMap.values()).map((layout) => {
                  const widthPercent = 100 / layout.columnCount;
                  const leftPercent = (layout.columnIndex * 100) / layout.columnCount;
                  const topPixels = layout.startSlot * 60 + layout.startOffset * 60;
                  const heightPixels = layout.duration * 60;
                  return (
                    <Paper
                      key={layout.event.id}
                      className={styles.eventCard}
                      onClick={() => {
                        setSelectedEventId(layout.event.id);
                      }}
                      style={{
                        width: `calc(${widthPercent}% - 4px)`,
                        left: `calc(${leftPercent}% + 2px)`,
                        top: `${topPixels}px`,
                        height: `${heightPixels}px`,
                        zIndex: layout.columnIndex + 1,
                      }}
                    >
                      <Typography variant="caption" className={styles.eventTitle}>
                        {layout.event.title}
                      </Typography>
                      {layout.event.description && heightPixels > 30 && (
                        <Typography
                          variant="caption"
                          className={styles.eventDescription}
                        >
                          {layout.event.description}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
      <EventDetailsModal
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
      />
    </Box>
  );
};

