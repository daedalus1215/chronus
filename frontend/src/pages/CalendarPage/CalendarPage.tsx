import React, { useState, useCallback } from 'react';
import { Box, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { CalendarView } from './components/CalendarView/CalendarView';
import { CreateEventModal } from './components/CreateEventModal/CreateEventModal';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { subDays, addDays } from 'date-fns';
import styles from './CalendarPage.module.css';

type DayRange = {
  startDate: Date;
  endDate: Date;
};

/**
 * Main calendar page component.
 * Displays an infinite scrolling calendar view with events and provides functionality to create new events.
 * Handles day range management and event creation through a modal.
 */
export const CalendarPage: React.FC = () => {
  const today = new Date();
  const initialStartDate = subDays(today, 30); // Load 30 days before today
  const initialEndDate = addDays(today, 30); // Load 30 days after today

  const [dayRange, setDayRange] = useState<DayRange>({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createEventDate, setCreateEventDate] = useState<Date | undefined>(
    undefined
  );
  const { events, isLoading, error, refetch } = useCalendarEvents(
    dayRange.startDate,
    dayRange.endDate
  );

  const handleLoadMoreDays = useCallback((direction: 'left' | 'right') => {
    setDayRange(prev => {
      if (direction === 'left') {
        const newStartDate = subDays(prev.startDate, 30);
        return {
          ...prev,
          startDate: newStartDate,
        };
      } else {
        const newEndDate = addDays(prev.endDate, 30);
        return {
          ...prev,
          endDate: newEndDate,
        };
      }
    });
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setDayRange(prev => {
      const newRange = { ...prev };

      // Ensure today is in the range, expand if needed
      if (today < prev.startDate) {
        newRange.startDate = subDays(today, 30);
      } else if (today > prev.endDate) {
        newRange.endDate = addDays(today, 30);
      }

      return newRange;
    });
  }, []);

  const handleCreateEvent = () => {
    setCreateEventDate(undefined);
    setIsCreateModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    // Create a date with the clicked hour
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);
    setCreateEventDate(clickedDate);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setCreateEventDate(undefined);
    refetch();
  };

  if (error) {
    return (
      <Box className={styles.calendarPage}>
        <Box className={styles.errorMessage}>
          Error loading calendar events: {error.message}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.calendarPage}>
      <CalendarView
        startDate={dayRange.startDate}
        endDate={dayRange.endDate}
        events={events}
        isLoading={isLoading}
        onLoadMoreDays={handleLoadMoreDays}
        onToday={handleToday}
        onTimeSlotClick={handleTimeSlotClick}
      />
      <Fab
        color="primary"
        aria-label="create event"
        onClick={handleCreateEvent}
        sx={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        defaultDate={createEventDate || new Date()}
      />
    </Box>
  );
};
