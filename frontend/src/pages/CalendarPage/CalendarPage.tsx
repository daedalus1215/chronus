import React, { useState } from 'react';
import { Box, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { CalendarView } from './components/CalendarView/CalendarView';
import { CreateEventModal } from './components/CreateEventModal/CreateEventModal';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { startOfWeek, addWeeks } from 'date-fns';
import styles from './CalendarPage.module.css';

export const CalendarPage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { events, isLoading, error, refetch } = useCalendarEvents(currentWeek);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
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
        weekStartDate={currentWeek}
        events={events}
        isLoading={isLoading}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
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
        defaultDate={new Date()}
      />
    </Box>
  );
};

