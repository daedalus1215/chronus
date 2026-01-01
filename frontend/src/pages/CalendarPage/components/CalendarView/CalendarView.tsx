import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, Today } from '@mui/icons-material';
import {
  format,
  eachDayOfInterval,
  endOfWeek,
} from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { CalendarEventResponseDto } from '../../../../api/dtos/calendar-events.dtos';
import { EventDetailsModal } from '../EventDetailsModal/EventDetailsModal';
import { useEventLayouts } from '../../hooks/useEventLayouts';
import { DayColumn } from './DayColumn/DayColumn';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useUpdateCalendarEvent } from '../../hooks/useUpdateCalendarEvent';
import {
  calculateDropPosition,
  calculateNewEventTimes,
} from '../../utils/event-drag.utils';
import styles from './CalendarView.module.css';

type CalendarViewProps = {
  weekStartDate: Date;
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

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
  const [draggedEvent, setDraggedEvent] = useState<CalendarEventResponseDto | null>(null);
  const dayLayoutMaps = useEventLayouts(weekStartDate, events);
  const isMobile = useIsMobile();
  const updateMutation = useUpdateCalendarEvent();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile
        ? {
            delay: 100,
            tolerance: 8,
          }
        : {
            distance: 8,
          },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
  );

  useEffect(() => {
    if (calendarGridRef.current) {
      calendarGridRef.current.scrollTop = 0;
    }
  }, [weekStartDate]);

  const handleDragStart = (event: DragStartEvent) => {
    const eventData = event.active.data.current?.event as
      | CalendarEventResponseDto
      | undefined;
    if (eventData) {
      setDraggedEvent(eventData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedEvent(null);
    const { active, over } = event;
    if (!over || !active.data.current?.event) {
      return;
    }
    const eventToMove = active.data.current.event as CalendarEventResponseDto;
    const dropDayData = over.data.current;
    if (!dropDayData?.day) {
      return;
    }
    const dropDay = dropDayData.day as Date;
    const dayElement = document.querySelector(
      `[data-day-id="${dropDay.toISOString()}"]`,
    ) as HTMLElement;
    if (!dayElement) {
      return;
    }
    const dayContent = dayElement.querySelector('[class*="dayContent"]') as HTMLElement;
    if (!dayContent) {
      return;
    }
    const activeRect = active.rect.current.translated ?? active.rect.current.initial;
    if (!activeRect) {
      return;
    }
    const dropTopY = activeRect.top;
    const dropPosition = calculateDropPosition(
      dropTopY,
      dayElement,
      dropDay,
    );
    if (!dropPosition) {
      return;
    }
    const { startDate, endDate } = calculateNewEventTimes(
      eventToMove,
      dropPosition,
    );
    try {
      await updateMutation.mutateAsync({
        id: eventToMove.id,
        event: {
          title: eventToMove.title,
          description: eventToMove.description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error moving calendar event:', error);
    }
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
        {isMobile ? (
          <>
            <IconButton
              onClick={onPreviousWeek}
              aria-label="Previous week"
              size="small"
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="subtitle1" className={styles.weekTitle}>
              {format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                onClick={onToday}
                aria-label="Today"
                size="small"
              >
                <Today />
              </IconButton>
              <IconButton
                onClick={onNextWeek}
                aria-label="Next week"
                size="small"
              >
                <ArrowForward />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
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
          </>
        )}
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
            <DayColumn
              key={day.toISOString()}
              day={day}
              layoutMap={dayLayoutMaps.get(day.toISOString()) || new Map()}
              timeSlots={timeSlots}
              onEventSelect={setSelectedEventId}
            />
          ))}
        </Box>
        <DragOverlay>
          {draggedEvent ? (
            <Box
              sx={{
                padding: '4px',
                backgroundColor: 'var(--color-primary, #6366f1)',
                color: 'var(--color-text, #fff)',
                borderRadius: '4px',
                minWidth: '120px',
                minHeight: '40px',
                opacity: 0.8,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                {draggedEvent.title}
              </Typography>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
      <EventDetailsModal
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
      />
    </Box>
  );
};

