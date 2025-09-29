/**
 * Date utility functions for consistent date handling across the application.
 * All functions work with local timezone to ensure dates match user expectations.
 */

/**
 * Gets the current date in YYYY-MM-DD format using local timezone.
 * This is the format expected by HTML date inputs and our API.
 * 
 * @returns Current date as YYYY-MM-DD string in local timezone
 */
export const getCurrentDateString = (): string => {
  return new Date().toLocaleDateString('en-CA');
};

/**
 * Gets a date string in YYYY-MM-DD format for a given Date object using local timezone.
 * 
 * @param date - The Date object to format
 * @returns Date as YYYY-MM-DD string in local timezone
 */
export const getDateString = (date: Date): string => {
  return date.toLocaleDateString('en-CA');
};

/**
 * Gets the current time in HH:MM format using local timezone.
 * This is the format expected by HTML time inputs.
 * 
 * @returns Current time as HH:MM string in local timezone
 */
export const getCurrentTimeString = (): string => {
  return new Date().toTimeString().slice(0, 5);
};

/**
 * Gets a time string in HH:MM format for a given Date object using local timezone.
 * 
 * @param date - The Date object to format
 * @returns Time as HH:MM string in local timezone
 */
export const getTimeString = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

/**
 * Parses a date string in YYYY-MM-DD format and returns a Date object.
 * The date is interpreted as local time (not UTC).
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Formats a date string for display using locale-specific formatting.
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
): string => {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('en-US', options);
};
