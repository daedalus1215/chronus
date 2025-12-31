/**
 * Domain entity for CalendarEvent.
 * Pure TypeScript type with no TypeORM dependencies.
 */
export type CalendarEvent = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

