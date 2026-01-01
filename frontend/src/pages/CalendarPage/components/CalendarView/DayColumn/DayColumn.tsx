import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { format, isToday } from 'date-fns';
import { EventLayoutMap } from '../../../hooks/useEventLayouts';
import { EventCard } from './EventCard/EventCard';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: Date;
  layoutMap: EventLayoutMap;
  timeSlots: number[];
  onEventSelect: (eventId: number) => void;
};

/**
 * Component for rendering a single day column in the calendar.
 * Displays the day header and all events for that day.
 *
 * @param props - Component props
 * @param props.day - The date for this column
 * @param props.layoutMap - Map of event IDs to their layout information
 * @param props.timeSlots - Array of hour indices (0-23)
 * @param props.onEventSelect - Callback when an event is clicked
 */
export const DayColumn: React.FC<DayColumnProps> = ({
  day,
  layoutMap,
  timeSlots,
  onEventSelect,
}) => {
  return (
    <Box className={styles.dayColumn}>
      <Paper
        className={`${styles.dayHeader} ${
          isToday(day) ? styles.today : ''
        }`}
      >
        <Typography variant="subtitle2">{format(day, 'EEE')}</Typography>
        <Typography variant="h6">{format(day, 'd')}</Typography>
      </Paper>
      <Box className={styles.dayContent}>
        {timeSlots.map((hour) => (
          <Box key={`${day.toISOString()}-${hour}`} className={styles.timeSlotCell} />
        ))}
        {Array.from(layoutMap.values()).map((layout) => (
          <EventCard
            key={layout.event.id}
            layout={layout}
            onSelect={onEventSelect}
          />
        ))}
      </Box>
    </Box>
  );
};

