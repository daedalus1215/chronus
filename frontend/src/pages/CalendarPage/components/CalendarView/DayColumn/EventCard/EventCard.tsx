import React from 'react';
import { Paper, Typography } from '@mui/material';
import { EventLayout } from '../../../../hooks/useEventLayouts';
import styles from './EventCard.module.css';

type EventCardProps = {
  layout: EventLayout;
  onSelect: (eventId: number) => void;
};

/**
 * Component for rendering a single calendar event card.
 * Handles positioning, sizing, and styling based on layout calculations.
 *
 * @param props - Component props
 * @param props.layout - Event layout information (position, size, column info)
 * @param props.onSelect - Callback when event is clicked
 */
export const EventCard: React.FC<EventCardProps> = ({ layout, onSelect }) => {
  const widthPercent = 100 / layout.columnCount;
  const leftPercent = (layout.columnIndex * 100) / layout.columnCount;
  const topPixels = layout.startSlot * 60 + layout.startOffset * 60;
  const heightPixels = layout.duration * 60;

  return (
    <Paper
      className={styles.eventCard}
      onClick={() => onSelect(layout.event.id)}
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
        <Typography variant="caption" className={styles.eventDescription}>
          {layout.event.description}
        </Typography>
      )}
    </Paper>
  );
};

