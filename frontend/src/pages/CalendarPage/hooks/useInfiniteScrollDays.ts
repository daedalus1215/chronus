import React, { useEffect, useRef, useCallback, useState } from 'react';
import { CALENDAR_CONSTANTS } from '../constants/calendar.constants';

type UseInfiniteScrollDaysOptions = {
  containerRef: React.RefObject<HTMLDivElement>;
  onLoadMoreDays: (direction: 'left' | 'right') => void;
  loadThreshold?: number; // Number of days from edge to trigger loading
};

type UseInfiniteScrollDaysReturn = {
  isLoadingLeft: boolean;
  isLoadingRight: boolean;
};

/**
 * Hook to detect scroll position and trigger loading more days when near edges.
 * Implements infinite scrolling for the calendar view.
 *
 * @param options - Configuration options
 * @param options.containerRef - Ref to the scrollable container
 * @param options.onLoadMoreDays - Callback to load more days
 * @param options.loadThreshold - Days from edge to trigger loading (default from constants)
 */
export const useInfiniteScrollDays = ({
  containerRef,
  onLoadMoreDays,
  loadThreshold = CALENDAR_CONSTANTS.SCROLL_THRESHOLD,
}: UseInfiniteScrollDaysOptions): UseInfiniteScrollDaysReturn => {
  const isLoadingRef = useRef(false);
  const dayWidthRef = useRef<number | null>(null);
  const [isLoadingLeft, setIsLoadingLeft] = useState(false);
  const [isLoadingRight, setIsLoadingRight] = useState(false);

  const calculateDayWidth = useCallback((): number => {
    if (dayWidthRef.current !== null) {
      return dayWidthRef.current;
    }
    // Estimate day width based on container or use default
    const isMobile = window.innerWidth <= 600;
    const estimatedWidth = isMobile
      ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
      : CALENDAR_CONSTANTS.DAY_WIDTH;
    dayWidthRef.current = estimatedWidth;
    return estimatedWidth;
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingRef.current) {
      return;
    }

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const scrollWidth = container.scrollWidth;
    const dayWidth = calculateDayWidth();

    // Calculate how many days from the start/end we are
    const daysFromStart = scrollLeft / dayWidth;
    const daysFromEnd = (scrollWidth - scrollLeft - containerWidth) / dayWidth;

    // Load more days if near edges
    if (daysFromStart < loadThreshold) {
      isLoadingRef.current = true;
      setIsLoadingLeft(true);
      onLoadMoreDays('left');
      // Reset loading flag after a delay to allow for async operations
      setTimeout(() => {
        isLoadingRef.current = false;
        setIsLoadingLeft(false);
      }, 1000);
    } else if (daysFromEnd < loadThreshold) {
      isLoadingRef.current = true;
      setIsLoadingRight(true);
      onLoadMoreDays('right');
      // Reset loading flag after a delay to allow for async operations
      setTimeout(() => {
        isLoadingRef.current = false;
        setIsLoadingRight(false);
      }, 1000);
    }
  }, [containerRef, onLoadMoreDays, loadThreshold, calculateDayWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Update day width when container size changes
    const updateDayWidth = () => {
      const firstDayElement = container.querySelector(
        '[data-day-id]'
      ) as HTMLElement;
      if (firstDayElement) {
        dayWidthRef.current = firstDayElement.offsetWidth;
      }
    };

    updateDayWidth();

    // Debounce scroll handler
    let scrollTimeout: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', debouncedHandleScroll);
    window.addEventListener('resize', updateDayWidth);

    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      window.removeEventListener('resize', updateDayWidth);
      clearTimeout(scrollTimeout);
    };
  }, [containerRef, handleScroll]);

  return {
    isLoadingLeft,
    isLoadingRight,
  };
};
