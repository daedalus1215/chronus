import React, { useCallback, useMemo, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CalendarEventResponseDto } from '../../../../api/dtos/calendar-events.dtos';
import { EventDetailsModal } from '../EventDetailsModal/EventDetailsModal';
import { MonthViewProps } from './MonthView.types';
import styles from './MonthViewDesktop.module.css';

const MAX_EVENTS_PER_DAY = 4;
const WEEKDAYS_DESKTOP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getEventColor = (eventId: number): string => {
  const colorIndex = eventId % 3;
  if (colorIndex === 0) {
    return 'var(--color-primary, #6366f1)';
  }
  if (colorIndex === 1) {
    return 'var(--color-secondary, #8b5cf6)';
  }
  return 'var(--color-tertiary, #f97316)';
};

export const MonthViewDesktop: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onDateChange,
  onViewChange,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = addDays(calendarStart, 41);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weeksDays = useMemo(() => {
    const grouped: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      grouped.push(calendarDays.slice(i, i + 7));
    }
    return grouped;
  }, [calendarDays]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventResponseDto[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.startDate), 'yyyy-MM-dd');
      const dayEvents = map.get(dateKey) ?? [];
      dayEvents.push(event);
      map.set(dateKey, dayEvents);
    });
    const visibleGridStart = weeksDays[0]?.[0];
    const visibleGridEnd = weeksDays[weeksDays.length - 1]?.[6];
    if (visibleGridStart && visibleGridEnd) {
      const gridStart = startOfDay(visibleGridStart);
      const gridEnd = endOfDay(visibleGridEnd);
      const overlapsGrid = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return eventStart <= gridEnd && eventEnd >= gridStart;
      });
      const overlapsGridButStartOutside = overlapsGrid.filter(event => {
        const eventStart = new Date(event.startDate);
        return eventStart < gridStart || eventStart > gridEnd;
      });
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/a1ee2f6c-81f1-40da-a534-f4dab2c41eea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'initial',
          hypothesisId: 'H4',
          location: 'MonthViewDesktop.tsx:58',
          message: 'Month desktop grouping stats',
          data: {
            currentDate: currentDate.toISOString(),
            totalEventsInput: events.length,
            recurringInput: events.filter(e => e.isRecurring).length,
            groupedDays: map.size,
            overlapsGridCount: overlapsGrid.length,
            overlapsGridButStartOutsideCount: overlapsGridButStartOutside.length,
            overlapsGridButStartOutsideRecurring: overlapsGridButStartOutside.filter(
              e => e.isRecurring
            ).length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    }
    return map;
  }, [events, weeksDays, currentDate]);

  const handleDayClick = useCallback(
    (day: Date) => {
      onDateChange(day);
      onViewChange('day');
    },
    [onDateChange, onViewChange]
  );

  const handleEventClick = useCallback(
    (event: CalendarEventResponseDto, mouseEvent: React.MouseEvent) => {
      mouseEvent.stopPropagation();
      setSelectedEventId(event.id);
    },
    []
  );

  const getDayEvents = (day: Date): CalendarEventResponseDto[] => {
    return eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
  };

  return (
    <Box className={styles.monthView}>
      <Paper className={styles.calendarContainer}>
        <Box className={styles.weekdayHeaders}>
          {WEEKDAYS_DESKTOP.map((day) => (
            <Typography key={day} variant="caption" className={styles.weekdayHeader}>
              {day}
            </Typography>
          ))}
        </Box>

        <Box className={styles.calendarRows}>
          {weeksDays.map((weekDays) => (
            <Box key={weekDays[0].toISOString()} className={styles.calendarRow}>
              {weekDays.map((day) => {
                const dayEvents = getDayEvents(day);
                const visibleEvents = dayEvents.slice(0, MAX_EVENTS_PER_DAY);
                const hiddenCount = dayEvents.length - MAX_EVENTS_PER_DAY;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <Box
                    key={day.toISOString()}
                    className={`
                      ${styles.dayCell}
                      ${!isCurrentMonth ? styles.otherMonth : ''}
                      ${isTodayDate ? styles.today : ''}
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    <Typography variant="body2" className={styles.dayNumber}>
                      {format(day, 'd')}
                    </Typography>

                    <Box className={styles.eventsContainer}>
                      {visibleEvents.map((event) => {
                        const timeStr = format(new Date(event.startDate), 'h:mma');
                        return (
                          <Box
                            key={event.id}
                            className={styles.eventItem}
                            onClick={(mouseEvent) => handleEventClick(event, mouseEvent)}
                            title={`${timeStr} ${event.title}`}
                          >
                            <Box
                              className={styles.eventDot}
                              style={{ backgroundColor: getEventColor(event.id) }}
                            />
                            <Typography className={styles.eventTime}>{timeStr}</Typography>
                            <Typography className={styles.eventTitle} noWrap>
                              {event.title}
                            </Typography>
                          </Box>
                        );
                      })}

                      {hiddenCount > 0 && (
                        <Typography variant="caption" className={styles.moreEvents}>
                          +{hiddenCount} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>

      <EventDetailsModal
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
      />
    </Box>
  );
};
