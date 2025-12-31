import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward, Today } from '@mui/icons-material';
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  isToday,
  isSameDay,
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

  const getEventsForDay = (day: Date): CalendarEventResponseDto[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      return isSameDay(eventStart, day);
    });
  };

  const getEventsForTimeSlot = (
    day: Date,
    hour: number,
  ): CalendarEventResponseDto[] => {
    return getEventsForDay(day).filter((event) => {
      const eventStart = new Date(event.startDate);
      return eventStart.getHours() === hour;
    });
  };

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

        {days.map((day) => (
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
              {timeSlots.map((hour) => {
                const slotEvents = getEventsForTimeSlot(day, hour);
                return (
                  <Box
                    key={`${day.toISOString()}-${hour}`}
                    className={styles.timeSlotCell}
                  >
                    {slotEvents.map((event) => (
                      <Paper
                        key={event.id}
                        className={styles.eventCard}
                        onClick={() => {
                          setSelectedEventId(event.id);
                        }}
                      >
                        <Typography variant="caption" className={styles.eventTitle}>
                          {event.title}
                        </Typography>
                        {event.description && (
                          <Typography
                            variant="caption"
                            className={styles.eventDescription}
                          >
                            {event.description}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
      <EventDetailsModal
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
      />
    </Box>
  );
};

