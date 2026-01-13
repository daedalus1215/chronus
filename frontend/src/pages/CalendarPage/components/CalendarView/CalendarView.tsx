import React, { useRef, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Today } from '@mui/icons-material';
import { format, eachDayOfInterval } from 'date-fns';
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
import { TimeColumn } from './TimeColumn/TimeColumn';
import { CurrentTimeIndicator } from './CurrentTimeIndicator/CurrentTimeIndicator';
import { SkeletonDayColumn } from './SkeletonDayColumn/SkeletonDayColumn';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useUpdateCalendarEvent } from '../../hooks/useUpdateCalendarEvent';
import { useInfiniteScrollDays } from '../../hooks/useInfiniteScrollDays';
import { useScrollToToday } from '../../hooks/useScrollToToday';
import { useCurrentTimeIndicator } from '../../hooks/useCurrentTimeIndicator';
import { useVisibleDateRange } from '../../hooks/useVisibleDateRange';
import { useVirtualizedDays } from '../../hooks/useVirtualizedDays';
import {
  calculateDropPosition,
  calculateNewEventTimes,
} from '../../utils/event-drag.utils';
import { snapToTimeSlot } from '../../utils/drag-modifiers.utils';
import { CALENDAR_CONSTANTS } from '../../constants/calendar.constants';
import styles from './CalendarView.module.css';

type CalendarViewProps = {
  startDate: Date;
  endDate: Date;
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  onLoadMoreDays: (direction: 'left' | 'right') => void;
  onToday: () => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
};

/**
 * Calendar view component displaying an infinite scrolling calendar grid with hourly time slots.
 * Shows events in their respective time slots and days.
 * Supports clicking events to view/edit details and infinite horizontal scrolling.
 *
 * @param props - Component props
 * @param props.startDate - The start date of the visible range (inclusive)
 * @param props.endDate - The end date of the visible range (inclusive)
 * @param props.events - Array of calendar events to display
 * @param props.isLoading - Whether events are currently loading
 * @param props.onLoadMoreDays - Callback to load more days when scrolling near edges
 * @param props.onToday - Callback to navigate to current day
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  startDate,
  endDate,
  events,
  isLoading,
  onLoadMoreDays,
  onToday,
  onTimeSlotClick,
  scrollContainerRef: externalRef,
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = externalRef || internalRef;

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const timeSlots = useMemo(
    () => Array.from({ length: CALENDAR_CONSTANTS.HOURS_PER_DAY }, (_, i) => i),
    []
  );

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [draggedEvent, setDraggedEvent] =
    useState<CalendarEventResponseDto | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>(
    'success'
  );

  const dayLayoutMaps = useEventLayouts(startDate, endDate, events);
  const isMobile = useIsMobile();
  const updateMutation = useUpdateCalendarEvent();

  // Infinite scrolling with loading indicators
  const { isLoadingLeft, isLoadingRight } = useInfiniteScrollDays({
    containerRef: calendarGridRef,
    onLoadMoreDays,
  });

  // Current time indicator
  const { currentTimePosition } = useCurrentTimeIndicator({
    days,
    isMobile,
  });

  // Visible date range for header
  const { visibleStartDate, visibleEndDate } = useVisibleDateRange({
    containerRef: calendarGridRef,
    days,
    isMobile,
  });

  // Auto-scroll to today on mount
  const { scrollToToday } = useScrollToToday({
    containerRef: calendarGridRef,
    days,
    isMobile,
    autoScrollOnMount: true,
    scrollToCurrentTime: true,
  });

  // Virtualization for day columns
  const virtualizer = useVirtualizedDays({
    containerRef: calendarGridRef,
    dayCount: days.length,
    isMobile,
  });

  // Drag and drop sensors
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
    })
  );

  // Handle Today button click
  const handleTodayClick = () => {
    onToday();
    scrollToToday();
  };

  // Drag and drop handlers
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
      `[data-day-id="${dropDay.toISOString()}"]`
    ) as HTMLElement;
    if (!dayElement) {
      return;
    }
    const dayContent = dayElement.querySelector(
      '[class*="dayContent"]'
    ) as HTMLElement;
    if (!dayContent) {
      return;
    }
    const activeRect =
      active.rect.current.translated ?? active.rect.current.initial;
    if (!activeRect) {
      return;
    }
    const dropTopY = activeRect.top;
    const dropPosition = calculateDropPosition(dropTopY, dayElement, dropDay);
    if (!dropPosition) {
      return;
    }
    const { startDate: newStartDate, endDate: newEndDate } =
      calculateNewEventTimes(eventToMove, dropPosition);
    try {
      await updateMutation.mutateAsync({
        id: eventToMove.id,
        event: {
          title: eventToMove.title,
          description: eventToMove.description,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error moving calendar event:', error);
      setToastSeverity('error');
      setToastMessage(
        error instanceof Error
          ? error.message || 'Failed to move event'
          : 'Failed to move event'
      );
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
        <Typography
          variant={isMobile ? 'subtitle1' : 'h5'}
          className={styles.weekTitle}
        >
          {format(visibleStartDate, 'MMM d')} -{' '}
          {format(visibleEndDate, 'MMM d, yyyy')}
        </Typography>
        <Button
          startIcon={<Today />}
          onClick={handleTodayClick}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Today
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapToTimeSlot]}
      >
        <Box className={styles.calendarGrid} ref={calendarGridRef}>
          <TimeColumn timeSlots={timeSlots} />
          
          {currentTimePosition !== null && (
            <CurrentTimeIndicator
              position={currentTimePosition}
              isMobile={isMobile}
            />
          )}

          {/* Virtualized day columns container */}
          <Box
            className={styles.virtualizedContainer}
            style={{
              width: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
              height: '100%',
            }}
          >
            {/* Loading skeletons on the left - positioned before the virtualized content */}
            {isLoadingLeft &&
              Array.from({ length: 3 }).map((_, i) => {
                const dayWidth = isMobile
                  ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
                  : CALENDAR_CONSTANTS.DAY_WIDTH;
                const leftOffset = -dayWidth * (3 - i);
                return (
                  <Box
                    key={`skeleton-left-${i}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${leftOffset}px`,
                      width: `${dayWidth}px`,
                      height: '100%',
                    }}
                  >
                    <SkeletonDayColumn timeSlots={timeSlots} />
                  </Box>
                );
              })}

            {/* Virtualized day columns - only render visible ones */}
            {virtualizer.getVirtualItems().map(virtualItem => {
              const day = days[virtualItem.index];
              if (!day) return null;

              return (
                <Box
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  data-virtual-key={virtualItem.key}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${virtualItem.start}px`,
                    width: `${virtualItem.size}px`,
                    height: '100%',
                  }}
                >
                  <DayColumn
                    day={day}
                    layoutMap={dayLayoutMaps.get(day.toISOString()) || new Map()}
                    timeSlots={timeSlots}
                    onEventSelect={setSelectedEventId}
                    onTimeSlotClick={onTimeSlotClick}
                  />
                </Box>
              );
            })}

            {/* Loading skeletons on the right - positioned after the virtualized content */}
            {isLoadingRight &&
              Array.from({ length: 3 }).map((_, i) => {
                const dayWidth = isMobile
                  ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
                  : CALENDAR_CONSTANTS.DAY_WIDTH;
                const leftOffset = virtualizer.getTotalSize() + dayWidth * i;
                return (
                  <Box
                    key={`skeleton-right-${i}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${leftOffset}px`,
                      width: `${dayWidth}px`,
                      height: '100%',
                    }}
                  >
                    <SkeletonDayColumn timeSlots={timeSlots} />
                  </Box>
                );
              })}
          </Box>
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
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, display: 'block' }}
              >
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
        onDeleteSuccess={() => {
          setToastSeverity('success');
          setToastMessage('Event deleted successfully');
        }}
        onDeleteError={error => {
          setToastSeverity('error');
          setToastMessage(error.message || 'Failed to delete event');
        }}
      />
      <Snackbar
        open={toastMessage !== null}
        autoHideDuration={6000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
