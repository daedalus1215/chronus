import { useState, useEffect } from 'react';
import { CALENDAR_CONSTANTS } from '../constants/calendar.constants';

type UseVisibleDateRangeOptions = {
  containerRef: React.RefObject<HTMLDivElement>;
  days: Date[];
  isMobile: boolean;
};

type VisibleDateRangeReturn = {
  visibleStartDate: Date;
  visibleEndDate: Date;
};

/**
 * Hook to calculate the visible date range based on scroll position
 */
export const useVisibleDateRange = ({
  containerRef,
  days,
  isMobile,
}: UseVisibleDateRangeOptions): VisibleDateRangeReturn => {
  const [visibleStartDate, setVisibleStartDate] = useState<Date>(
    days[0] || new Date()
  );
  const [visibleEndDate, setVisibleEndDate] = useState<Date>(
    days[days.length - 1] || new Date()
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || days.length === 0) {
      return;
    }

    const updateVisibleRange = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const dayWidth = isMobile
        ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
        : CALENDAR_CONSTANTS.DAY_WIDTH;

      const firstVisibleDayIndex = Math.max(
        0,
        Math.floor(scrollLeft / dayWidth)
      );
      const lastVisibleDayIndex = Math.min(
        days.length - 1,
        Math.ceil((scrollLeft + containerWidth) / dayWidth)
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
  }, [containerRef, days, isMobile]);

  return {
    visibleStartDate,
    visibleEndDate,
  };
};
