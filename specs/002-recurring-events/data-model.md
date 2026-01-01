# Data Model: Recurring Events

**Date**: 2024-12-30  
**Feature**: Recurring Events

## Entity: RecurringEvent

### Domain Entity (Pure TypeScript)

```typescript
// domain/entities/recurring-event.entity.ts
export type RecurringEvent = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;  // First occurrence start date/time
  endDate: Date;    // First occurrence end date/time
  recurrencePattern: RecurrencePattern;  // Value object
  recurrenceEndDate?: Date;  // Optional end date for series
  noEndDate: boolean;  // Flag for infinite series
  createdAt: Date;
  updatedAt: Date;
};
```

### Infrastructure Entity (TypeORM)

```typescript
// infra/entities/recurring-event.entity.ts
@Entity({ name: 'recurring_events' })
export class RecurringEventEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ name: 'recurrence_type', type: 'varchar', length: 20 })
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @Column({ name: 'recurrence_interval', type: 'int', default: 1 })
  recurrenceInterval: number;  // For future: every N days/weeks/months/years

  @Column({ name: 'days_of_week', type: 'varchar', length: 20, nullable: true })
  daysOfWeek?: string;  // Comma-separated: "1,3,5" for Mon,Wed,Fri

  @Column({ name: 'recurrence_end_date', type: 'datetime', nullable: true })
  recurrenceEndDate?: Date;

  @Column({ name: 'no_end_date', type: 'boolean', default: false })
  noEndDate: boolean;

  @Column({ name: 'rrule_string', type: 'text' })
  rruleString: string;  // RFC 5545 RRULE string for rrule library

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
```

## Entity: EventInstance

### Domain Entity (Pure TypeScript)

```typescript
// domain/entities/event-instance.entity.ts
export type EventInstance = {
  id: number;
  recurringEventId: number;
  instanceDate: Date;  // Date of this instance (start of day)
  startDate: Date;     // Actual start date/time (may be overridden)
  endDate: Date;       // Actual end date/time (may be overridden)
  isModified: boolean; // True if this instance has been individually modified
  titleOverride?: string;
  descriptionOverride?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### Infrastructure Entity (TypeORM)

```typescript
// infra/entities/event-instance.entity.ts
@Entity({ name: 'event_instances' })
export class EventInstanceEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'recurring_event_id', type: 'int' })
  recurringEventId: number;

  @Column({ name: 'instance_date', type: 'date' })
  instanceDate: Date;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ name: 'is_modified', type: 'boolean', default: false })
  isModified: boolean;

  @Column({ name: 'title_override', type: 'varchar', length: 255, nullable: true })
  titleOverride?: string;

  @Column({ name: 'description_override', type: 'text', nullable: true })
  descriptionOverride?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => RecurringEventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recurring_event_id' })
  recurringEvent: RecurringEventEntity;
}
```

## Entity: RecurrenceException

### Domain Entity (Pure TypeScript)

```typescript
// domain/entities/recurrence-exception.entity.ts
export type RecurrenceException = {
  id: number;
  recurringEventId: number;
  exceptionDate: Date;  // Date of the skipped/deleted instance
  createdAt: Date;
};
```

### Infrastructure Entity (TypeORM)

```typescript
// infra/entities/recurrence-exception.entity.ts
@Entity({ name: 'recurrence_exceptions' })
export class RecurrenceExceptionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'recurring_event_id', type: 'int' })
  recurringEventId: number;

  @Column({ name: 'exception_date', type: 'date' })
  exceptionDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => RecurringEventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recurring_event_id' })
  recurringEvent: RecurringEventEntity;

  @Index(['recurring_event_id', 'exception_date'], { unique: true })
  uniqueException: any;
}
```

## Value Object: RecurrencePattern

### Domain Value Object (Pure TypeScript)

```typescript
// domain/entities/recurrence-pattern.value-object.ts
export type RecurrencePattern = {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;  // For MVP: must be 1. For future: every N days/weeks/months/years
  daysOfWeek?: number[];  // For WEEKLY type: [1,3,5] for Mon,Wed,Fri (1=Monday, 7=Sunday)
  dayOfMonth?: number;  // For MONTHLY type: day of month (1-31). Note: "Same day of week" patterns (e.g., first Monday) are post-MVP
  monthOfYear?: number;  // For YEARLY type: month (1-12)
};
```

## Field Descriptions

### RecurringEvent

#### id
- **Type**: number (auto-increment integer)
- **Purpose**: Unique identifier for the recurring event series
- **Constraints**: Primary key, auto-generated

#### userId
- **Type**: number
- **Purpose**: Links recurring event to the user who owns it
- **Constraints**: Required, must reference existing user
- **Business Rule**: Recurring events are user-scoped

#### title
- **Type**: string
- **Purpose**: Event title/name displayed on calendar
- **Constraints**: Required, max 255 characters, non-empty

#### description
- **Type**: string (optional)
- **Purpose**: Optional detailed description of the event
- **Constraints**: Optional, text field

#### startDate / endDate
- **Type**: Date (datetime)
- **Purpose**: First occurrence's start and end date/time
- **Constraints**: Required, endDate must be after startDate
- **Business Rule**: Used as template for generating instances

#### recurrencePattern
- **Type**: RecurrencePattern value object
- **Purpose**: Defines how the event repeats
- **Constraints**: Required, must be valid pattern type

#### recurrenceEndDate
- **Type**: Date (optional)
- **Purpose**: Last date for the recurring series
- **Constraints**: Optional, must be after startDate if provided
- **Business Rule**: If provided, no instances generated after this date

#### noEndDate
- **Type**: boolean
- **Purpose**: Flag indicating infinite series
- **Constraints**: Default false
- **Business Rule**: If true, generate instances up to 2 years ahead (or visible range)

#### rruleString
- **Type**: string
- **Purpose**: RFC 5545 RRULE string for rrule library
- **Constraints**: Required, must be valid RRULE format
- **Business Rule**: Generated from recurrencePattern, used by rrule library

### EventInstance

#### id
- **Type**: number (auto-increment integer)
- **Purpose**: Unique identifier for the event instance
- **Constraints**: Primary key, auto-generated

#### recurringEventId
- **Type**: number
- **Purpose**: Links instance to its recurring event series
- **Constraints**: Required, foreign key to recurring_events
- **Business Rule**: Instance belongs to one recurring event

#### instanceDate
- **Type**: Date (date only)
- **Purpose**: Date of this instance occurrence
- **Constraints**: Required, date only (no time component)
- **Business Rule**: Used for grouping and querying instances by date

#### startDate / endDate
- **Type**: Date (datetime)
- **Purpose**: Actual start and end date/time for this instance
- **Constraints**: Required, endDate must be after startDate
- **Business Rule**: May be overridden from original if isModified is true

#### isModified
- **Type**: boolean
- **Purpose**: Flag indicating this instance has been individually modified
- **Constraints**: Default false
- **Business Rule**: If true, use override fields instead of series defaults

#### titleOverride / descriptionOverride
- **Type**: string (optional)
- **Purpose**: Override values for modified instances
- **Constraints**: Optional, only used if isModified is true
- **Business Rule**: If provided, these values override series title/description

### RecurrenceException

#### id
- **Type**: number (auto-increment integer)
- **Purpose**: Unique identifier for the exception
- **Constraints**: Primary key, auto-generated

#### recurringEventId
- **Type**: number
- **Purpose**: Links exception to its recurring event series
- **Constraints**: Required, foreign key to recurring_events
- **Business Rule**: Exception belongs to one recurring event

#### exceptionDate
- **Type**: Date (date only)
- **Purpose**: Date of the skipped/deleted instance
- **Constraints**: Required, unique per recurring event
- **Business Rule**: No instance generated for this date

## Validation Rules

### RecurringEvent Creation Rules
1. `title` MUST be provided and non-empty (trimmed)
2. `title` MUST be 255 characters or less
3. `startDate` MUST be provided and valid datetime
4. `endDate` MUST be provided and valid datetime
5. `endDate` MUST be after `startDate`
6. `userId` MUST match authenticated user
7. `recurrencePattern.type` MUST be one of: DAILY, WEEKLY, MONTHLY, YEARLY
8. `recurrencePattern.interval` MUST be 1 for MVP (future: positive integer)
9. For WEEKLY: `recurrencePattern.daysOfWeek` MUST be provided and non-empty array
10. For WEEKLY: `daysOfWeek` values MUST be 1-7 (Monday-Sunday)
11. `recurrenceEndDate` MUST be after `startDate` if provided
12. `noEndDate` and `recurrenceEndDate` MUST NOT both be true/set (mutually exclusive)
13. `rruleString` MUST be valid RFC 5545 RRULE format

### EventInstance Creation Rules
1. `recurringEventId` MUST reference existing RecurringEvent
2. `instanceDate` MUST be valid date
3. `startDate` and `endDate` MUST be valid datetimes
4. `endDate` MUST be after `startDate`
5. If `isModified` is true, at least one override field MUST be provided

### RecurrenceException Creation Rules
1. `recurringEventId` MUST reference existing RecurringEvent
2. `exceptionDate` MUST be valid date
3. `exceptionDate` MUST be unique per `recurringEventId`

## State Transitions

### RecurringEvent
- **Created**: New recurring event with pattern defined
- **Updated**: Pattern or metadata changed (regenerates instances)
- **Deleted**: Entire series removed (cascades to instances and exceptions)

### EventInstance
- **Generated**: Automatically created from recurrence pattern
- **Modified**: User edits individual instance (isModified = true, overrides set)
- **Deleted**: Individual instance removed (creates RecurrenceException)

## Relationships

### RecurringEvent → EventInstance (One-to-Many)
- Each RecurringEvent has many EventInstances
- Cascade delete: Deleting RecurringEvent deletes all instances
- Relationship via `recurringEventId` foreign key

### RecurringEvent → RecurrenceException (One-to-Many)
- Each RecurringEvent has many RecurrenceExceptions (skipped instances)
- Cascade delete: Deleting RecurringEvent deletes all exceptions
- Relationship via `recurringEventId` foreign key

### RecurringEvent → User (Many-to-One)
- Each RecurringEvent belongs to one User
- Relationship is implicit via `userId` field

## Database Schema

```sql
CREATE TABLE recurring_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  recurrence_type VARCHAR(20) NOT NULL CHECK(recurrence_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  days_of_week VARCHAR(20),
  recurrence_end_date DATETIME,
  no_end_date BOOLEAN NOT NULL DEFAULT 0,
  rrule_string TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recurring_event_id INTEGER NOT NULL,
  instance_date DATE NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_modified BOOLEAN NOT NULL DEFAULT 0,
  title_override VARCHAR(255),
  description_override TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recurring_event_id) REFERENCES recurring_events(id) ON DELETE CASCADE
);

CREATE TABLE recurrence_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recurring_event_id INTEGER NOT NULL,
  exception_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recurring_event_id) REFERENCES recurring_events(id) ON DELETE CASCADE,
  UNIQUE(recurring_event_id, exception_date)
);

CREATE INDEX idx_recurring_events_user_id ON recurring_events(user_id);
CREATE INDEX idx_recurring_events_start_date ON recurring_events(start_date);
CREATE INDEX idx_event_instances_recurring_event_id ON event_instances(recurring_event_id);
CREATE INDEX idx_event_instances_instance_date ON event_instances(instance_date);
CREATE INDEX idx_event_instances_date_range ON event_instances(instance_date, start_date, end_date);
CREATE INDEX idx_recurrence_exceptions_recurring_event_id ON recurrence_exceptions(recurring_event_id);
CREATE INDEX idx_recurrence_exceptions_date ON recurrence_exceptions(exception_date);
```

## Mapping Between Domain and Infrastructure

### Domain → Infrastructure
- Domain `RecurringEvent` maps to `RecurringEventEntity`
- Domain `RecurrencePattern` value object serialized to `recurrenceType`, `daysOfWeek`, `rruleString` columns
- Domain `EventInstance` maps to `EventInstanceEntity`
- Domain `RecurrenceException` maps to `RecurrenceExceptionEntity`
- Date objects stored as DATETIME/DATE in SQLite

### Infrastructure → Domain
- TypeORM entities converted to domain entities in repositories
- `rruleString` parsed to reconstruct `RecurrencePattern` value object
- All datetime columns converted to JavaScript Date objects
- Nullable fields converted to optional TypeScript properties

## Edge Cases Handled

1. **Month-end dates**: rrule handles automatically (e.g., monthly on 31st falls back to last day)
2. **Leap years**: rrule handles February 29th correctly
3. **DST transitions**: rrule uses UTC, timezone conversion handled in application layer
4. **Timezone changes**: Patterns stored in UTC, converted to user timezone on display
5. **Very long series**: Generate instances for visible range only (2 years default)
6. **Modified instances**: Stored separately, preserved when series is updated
7. **Deleted instances**: Stored as RecurrenceException, excluded from generation

