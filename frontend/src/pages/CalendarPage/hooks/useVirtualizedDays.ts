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
 */
export const useVirtualizedDays = ({
  containerRef,
  dayCount,
  isMobile,
}: UseVirtualizedDaysOptions) => {
  const dayWidth = isMobile
    ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
    : CALENDAR_CONSTANTS.DAY_WIDTH;

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: dayCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => dayWidth,
    overscan: CALENDAR_CONSTANTS.VIRTUALIZATION_OVERSCAN,
  });

  return virtualizer;
};
