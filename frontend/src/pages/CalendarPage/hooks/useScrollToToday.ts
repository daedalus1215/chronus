import { useEffect, useState, useCallback, useRef } from 'react';
import { isToday } from 'date-fns';
import { scrollToElementHorizontally, findElementWithRetry, scrollToHour } from '../utils/scroll.utils';
import { CALENDAR_CONSTANTS } from '../constants/calendar.constants';

type UseScrollToTodayOptions = {
  containerRef: React.RefObject<HTMLDivElement>;
  days: Date[];
  isMobile: boolean;
  autoScrollOnMount?: boolean;
  scrollToCurrentTime?: boolean;
};

/**
 * Hook to handle scrolling to today's date and current time
 */
export const useScrollToToday = ({
  containerRef,
  days,
  isMobile,
  autoScrollOnMount = true,
  scrollToCurrentTime = true,
}: UseScrollToTodayOptions) => {
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  const scrollAttemptedRef = useRef(false);

  const scrollToToday = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const todayDay = days.find(day => isToday(day));
    if (!todayDay) {
      return;
    }

    const delay = isMobile
      ? CALENDAR_CONSTANTS.SCROLL_DELAY_MOBILE
      : CALENDAR_CONSTANTS.SCROLL_DELAY_DESKTOP;

    // Wait for layout to be ready
    await new Promise(resolve => setTimeout(resolve, delay));

    // Find today's column with retry logic
    const todayElement = await findElementWithRetry(
      `[data-day-id="${todayDay.toISOString()}"]`,
      CALENDAR_CONSTANTS.SCROLL_RETRY_ATTEMPTS,
      delay
    );

    if (!todayElement || !container) {
      return;
    }

    // Scroll horizontally to today
    scrollToElementHorizontally(container, todayElement, 'smooth');

    // Scroll vertically to current time
    if (scrollToCurrentTime) {
      const now = new Date();
      scrollToHour(container, now.getHours());
    }

    setHasScrolledToToday(true);
  }, [containerRef, days, isMobile, scrollToCurrentTime]);

  // Auto-scroll on mount
  useEffect(() => {
    if (autoScrollOnMount && !hasScrolledToToday && !scrollAttemptedRef.current) {
      scrollAttemptedRef.current = true;
      requestAnimationFrame(() => {
        scrollToToday();
      });
    }
  }, [autoScrollOnMount, hasScrolledToToday, scrollToToday]);

  return {
    scrollToToday,
    hasScrolledToToday,
  };
};
