import { useVirtualizer } from '@tanstack/react-virtual';
import { CALENDAR_CONSTANTS } from '../constants/calendar.constants';

type UseVirtualizedDaysOptions = {
  containerRef: React.RefObject<HTMLDivElement>;
  dayCount: number;
  isMobile: boolean;
};

/**
 * Hook to virtualize day columns for optimal performance
 * Only renders visible columns plus overscan buffer
 * Uses dynamic measurement to get actual rendered widths
 */
export const useVirtualizedDays = ({
  containerRef,
  dayCount,
  isMobile,
}: UseVirtualizedDaysOptions) => {
  // Fallback estimate if measurement not available
  const dayWidth = isMobile
    ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
    : CALENDAR_CONSTANTS.DAY_WIDTH;

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: dayCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => dayWidth,
    overscan: CALENDAR_CONSTANTS.VIRTUALIZATION_OVERSCAN,
    // Dynamic measurement: measure actual rendered element width
    // This allows the virtualizer to adapt if CSS changes affect column widths
    measureElement: (element) => {
      if (!element) {
        return dayWidth; // Fallback to estimate
      }
      
      // Find the DayColumn element inside the wrapper Box
      const dayColumnElement = element.querySelector('[data-day-id]') as HTMLElement;
      
      if (dayColumnElement) {
        // Get computed styles to find the natural width
        const computedStyle = window.getComputedStyle(dayColumnElement);
        
        // Get min-width from CSS - this is the natural/minimum width of the column
        // DayColumn has min-width: 150px (desktop) or 100px (mobile)
        const minWidthValue = computedStyle.minWidth;
        const minWidth = minWidthValue ? parseFloat(minWidthValue) : 0;
        
        // Get the actual rendered width (may be constrained by wrapper)
        const rect = dayColumnElement.getBoundingClientRect();
        const renderedWidth = rect.width;
        
        // Use min-width if it's larger than rendered width (natural width)
        // Otherwise use rendered width (which may be constrained but is accurate)
        // This handles cases where CSS min-width changes
        if (minWidth > 0 && minWidth > renderedWidth) {
          return minWidth;
        }
        
        if (renderedWidth > 0) {
          return renderedWidth;
        }
        
        if (minWidth > 0) {
          return minWidth;
        }
      }
      
      // Fallback: measure the wrapper element itself
      const wrapperRect = element.getBoundingClientRect();
      if (wrapperRect.width > 0) {
        return wrapperRect.width;
      }
      
      // Final fallback to estimate
      return dayWidth;
    },
    // Enable smooth scrolling
    enableSmoothScroll: true,
  });

  return virtualizer;
};
