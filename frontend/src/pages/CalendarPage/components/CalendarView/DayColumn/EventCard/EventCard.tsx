import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Repeat as RepeatIcon } from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EventLayout } from '../../../../hooks/useEventLayouts';
import styles from './EventCard.module.css';

type EventCardProps = {
  layout: EventLayout;
  onSelect: (eventId: number) => void;
};

/**
 * Component for rendering a single calendar event card.
 * Handles positioning, sizing, and styling based on layout calculations.
 * Supports drag and drop functionality.
 *
 * @param props - Component props
 * @param props.layout - Event layout information (position, size, column info)
 * @param props.onSelect - Callback when event is clicked
 */
export const EventCard: React.FC<EventCardProps> = ({ layout, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `event-${layout.event.id}`,
    data: {
      event: layout.event,
    },
  });

  const widthPercent = 100 / layout.columnCount;
  const leftPercent = (layout.columnIndex * 100) / layout.columnCount;
  const topPixels = layout.startSlot * 60 + layout.startOffset * 60;
  const heightPixels = layout.duration * 60;

  const style = {
    width: `calc(${widthPercent}% - 4px)`,
    left: `calc(${leftPercent}% + 2px)`,
    top: `${topPixels}px`,
    height: `${heightPixels}px`,
    zIndex: isDragging ? 1000 : layout.columnIndex + 1,
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onSelect(layout.event.id);
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      className={`${styles.eventCard} ${isDragging ? styles.dragging : ''} ${
        layout.event.isRecurring ? styles.recurring : ''
      }`}
      onClick={handleClick}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Box className={styles.eventContent}>
        {layout.event.isRecurring && (
          <RepeatIcon className={styles.recurringIcon} fontSize="inherit" />
        )}
        <Typography variant="caption" className={styles.eventTitle}>
          {layout.event.title}
        </Typography>
      </Box>
      {layout.event.description && heightPixels > 30 && (
        <Typography variant="caption" className={styles.eventDescription}>
          {layout.event.description}
        </Typography>
      )}
    </Paper>
  );
};

