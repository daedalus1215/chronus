import { isToday, isWeekend } from 'date-fns';
import { CALENDAR_CONSTANTS } from '../constants/calendar.constants';

type DayWidthOptions = {
  isMobile: boolean;
  todayMultiplier?: number; // Multiplier for today's width (default: 1.4 = 40% wider)
  weekendMultiplier?: number; // Multiplier for weekend width (default: 0.75 = 25% narrower)
};

/**
 * Calculate the width for a day column based on whether it's today or a weekend
 * 
 * @param day - The date to calculate width for
 * @param options - Configuration options
 * @returns Width in pixels
 */
export const calculateDayWidth = (
  day: Date,
  options: DayWidthOptions
): number => {
  const {
    isMobile,
    todayMultiplier = 1.4, // 40% wider for today
    weekendMultiplier = 0.75, // 25% narrower for weekends
  } = options;

  // Base width from constants
  const baseWidth = isMobile
    ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
    : CALENDAR_CONSTANTS.DAY_WIDTH;

  // Check if it's today
  const isTodayDay = isToday(day);
  
  // Check if it's a weekend
  const isWeekendDay = isWeekend(day);

  // Calculate width with priority: today > weekend > normal
  if (isTodayDay) {
    // Today gets the multiplier (40% wider)
    return Math.round(baseWidth * todayMultiplier);
  }

  if (isWeekendDay) {
    // Weekends get the multiplier (25% narrower)
    return Math.round(baseWidth * weekendMultiplier);
  }

  // Normal weekday
  return baseWidth;
};

/**
 * Get width calculation function for use with virtualization
 * Returns a function that can be used to calculate width by index
 */
export const createDayWidthCalculator = (
  days: Date[],
  options: DayWidthOptions
): ((index: number) => number) => {
  return (index: number) => {
    const day = days[index];
    if (!day) {
      // Fallback to base width if day not found
      return options.isMobile
        ? CALENDAR_CONSTANTS.MOBILE_DAY_WIDTH
        : CALENDAR_CONSTANTS.DAY_WIDTH;
    }
    return calculateDayWidth(day, options);
  };
};
