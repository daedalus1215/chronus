import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton, Snackbar, Alert } from '@mui/material';
import { Today, WbSunny, Nightlight } from '@mui/icons-material';
import {
  format,
  eachDayOfInterval,
  isToday,
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
import { useInfiniteScrollDays } from '../../hooks/useInfiniteScrollDays';
import {
  calculateDropPosition,
  calculateNewEventTimes,
} from '../../utils/event-drag.utils';
import styles from './CalendarView.module.css';

type CalendarViewProps = {
  startDate: Date;
  endDate: Date;
  events: CalendarEventResponseDto[];
  isLoading: boolean;
  onLoadMoreDays: (direction: 'left' | 'right') => void;
  onToday: () => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
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
}) => {
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);

  // Format hour in 12-hour format with AM/PM
  const formatHour = (hour: number): { hour: number; period: 'AM' | 'PM'; isDay: boolean } => {
    if (hour === 0) {
      return { hour: 12, period: 'AM', isDay: false };
    } else if (hour < 12) {
      return { hour, period: 'AM', isDay: hour >= 6 };
    } else if (hour === 12) {
      return { hour: 12, period: 'PM', isDay: true };
    } else {
      return { hour: hour - 12, period: 'PM', isDay: hour < 18 };
    }
  };
  const [draggedEvent, setDraggedEvent] = useState<CalendarEventResponseDto | null>(null);
  const dayLayoutMaps = useEventLayouts(startDate, endDate, events);
  const isMobile = useIsMobile();

  // Infinite scrolling
  useInfiniteScrollDays({
    containerRef: calendarGridRef,
    dayRange: { startDate, endDate },
    onLoadMoreDays,
  });
  const updateMutation = useUpdateCalendarEvent();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [visibleStartDate, setVisibleStartDate] = useState<Date>(startDate);
  const [visibleEndDate, setVisibleEndDate] = useState<Date>(endDate);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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

  // Auto-scroll to current day on initial mount
  useEffect(() => {
    if (hasScrolledToToday || !calendarGridRef.current) {
      return;
    }

    const container = calendarGridRef.current;
    const todayDay = days.find((day) => isToday(day));

    if (!todayDay) {
      return;
    }

    // Wait for layout to be ready - use multiple attempts for mobile
    const scrollToToday = (attempt = 0) => {
      const todayElement = container.querySelector(
        `[data-day-id="${todayDay.toISOString()}"]`,
      ) as HTMLElement;

      if (!todayElement || !container) {
        // Retry if element not found yet (especially on mobile)
        if (attempt < 5) {
          setTimeout(() => scrollToToday(attempt + 1), 150);
        }
        return;
      }

      // Calculate scroll position more reliably
      const containerRect = container.getBoundingClientRect();
      const elementRect = todayElement.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const elementLeft = elementRect.left - containerRect.left + scrollLeft;
      const elementWidth = todayElement.offsetWidth;
      const containerWidth = container.clientWidth;

      // Center the today column in the viewport
      const targetScrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
      setHasScrolledToToday(true);
    };

    // Use multiple delays for mobile devices which may need more time
    const delay = isMobile ? 300 : 150;
    requestAnimationFrame(() => {
      setTimeout(() => scrollToToday(), delay);
    });
  }, [hasScrolledToToday, days, isMobile]);

  // Scroll to today when Today button is clicked
  const handleTodayClick = () => {
    onToday();
    if (!calendarGridRef.current) {
      return;
    }

    const container = calendarGridRef.current;
    const todayDay = days.find((day) => isToday(day));

    if (!todayDay) {
      return;
    }

    // Wait a bit for the day range to update if needed
    const scrollToToday = (attempt = 0) => {
      const todayElement = container.querySelector(
        `[data-day-id="${todayDay.toISOString()}"]`,
      ) as HTMLElement;

      if (!todayElement || !container) {
        // Retry if element not found yet
        if (attempt < 5) {
          setTimeout(() => scrollToToday(attempt + 1), 150);
        }
        return;
      }

      // Calculate scroll position more reliably
      const containerRect = container.getBoundingClientRect();
      const elementRect = todayElement.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const elementLeft = elementRect.left - containerRect.left + scrollLeft;
      const elementWidth = todayElement.offsetWidth;
      const containerWidth = container.clientWidth;

      // Center the today column in the viewport
      const targetScrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    };

    const delay = isMobile ? 300 : 150;
    setTimeout(() => scrollToToday(), delay);
  };


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
    const { startDate: newStartDate, endDate: newEndDate } = calculateNewEventTimes(
      eventToMove,
      dropPosition,
    );
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
          : 'Failed to move event',
      );
    }
  };

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate if today is in the visible range and get the current time position
  const isTodayInRange = days.some((day) => isToday(day));
  const getCurrentTimePosition = (): number | null => {
    if (!isTodayInRange) {
      return null;
    }
    const now = currentTime;
    const headerHeight = isMobile ? 55 : 60;
    const slotHeight = 60;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const position = headerHeight + hours * slotHeight + (minutes / 60) * slotHeight;
    return position;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Calculate visible date range from scroll position
  useEffect(() => {
    const container = calendarGridRef.current;
    if (!container) {
      return;
    }

    const updateVisibleRange = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const dayWidth = isMobile ? 100 : 150; // Approximate day width

      const firstVisibleDayIndex = Math.max(0, Math.floor(scrollLeft / dayWidth));
      const lastVisibleDayIndex = Math.min(
        days.length - 1,
        Math.ceil((scrollLeft + containerWidth) / dayWidth),
      );

      if (days[firstVisibleDayIndex] && days[lastVisibleDayIndex]) {
        setVisibleStartDate(days[firstVisibleDayIndex]);
        setVisibleEndDate(days[lastVisibleDayIndex]);
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(updateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll);
    updateVisibleRange(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [days, isMobile]);

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
          {format(visibleStartDate, 'MMM d')} - {format(visibleEndDate, 'MMM d, yyyy')}
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
      >
        <Box className={styles.calendarGrid} ref={calendarGridRef}>
          <Box className={styles.timeColumn}>
            <Box className={styles.timeSlotHeader}></Box>
            {timeSlots.map((hour) => {
              const { hour: displayHour, period, isDay } = formatHour(hour);
              return (
                <Box key={hour} className={styles.timeSlot}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isDay ? (
                      <WbSunny sx={{ fontSize: '0.875rem', color: '#f59e0b' }} />
                    ) : (
                      <Nightlight sx={{ fontSize: '0.875rem', color: '#6366f1' }} />
                    )}
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      {displayHour}:00 {period}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          {currentTimePosition !== null && (
            <Box
              sx={{
                position: 'absolute',
                top: `${currentTimePosition}px`,
                left: isMobile ? '50px' : '100px',
                right: 0,
                height: '2px',
                backgroundColor: '#ef4444',
                zIndex: 25,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '-8px',
                  top: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid var(--color-card-bg, #1e1e1e)',
                  boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
                },
              }}
            />
          )}

          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              layoutMap={dayLayoutMaps.get(day.toISOString()) || new Map()}
              timeSlots={timeSlots}
              onEventSelect={setSelectedEventId}
              onTimeSlotClick={onTimeSlotClick}
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
        onDeleteSuccess={() => {
          setToastSeverity('success');
          setToastMessage('Event deleted successfully');
        }}
        onDeleteError={(error) => {
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

