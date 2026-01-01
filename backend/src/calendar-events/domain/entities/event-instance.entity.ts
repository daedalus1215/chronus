/**
 * Domain entity for EventInstance.
 * Pure TypeScript type with no TypeORM dependencies.
 */
export type EventInstance = {
  id: number;
  recurringEventId: number;
  instanceDate: Date; // Date of this instance (start of day)
  startDate: Date; // Actual start date/time (may be overridden)
  endDate: Date; // Actual end date/time (may be overridden)
  isModified: boolean; // True if this instance has been individually modified
  titleOverride?: string;
  descriptionOverride?: string;
  createdAt: Date;
  updatedAt: Date;
};

