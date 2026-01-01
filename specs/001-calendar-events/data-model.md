# Data Model: Calendar Events

**Date**: 2024-12-30  
**Feature**: Calendar Events

## Entity: CalendarEvent

### Domain Entity (Pure TypeScript)

```typescript
// domain/entities/calendar-event.entity.ts
export type CalendarEvent = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;  // Date and start time combined
  endDate: Date;    // Date and end time combined
  createdAt: Date;
  updatedAt: Date;
};
```

### Infrastructure Entity (TypeORM)

```typescript
// infra/entities/calendar-event.entity.ts
@Entity({ name: 'calendar_events' })
export class CalendarEventEntity {
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

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
```

## Field Descriptions

### id
- **Type**: number (auto-increment integer)
- **Purpose**: Unique identifier for the calendar event
- **Constraints**: Primary key, auto-generated

### userId
- **Type**: number
- **Purpose**: Links event to the user who owns it
- **Constraints**: Required, must reference existing user
- **Business Rule**: Events are user-scoped (users only see their own events)

### title
- **Type**: string
- **Purpose**: Event title/name displayed on calendar
- **Constraints**: Required, max 255 characters, non-empty

### description
- **Type**: string (optional)
- **Purpose**: Optional detailed description of the event
- **Constraints**: Optional, text field (unlimited length)

### startDate
- **Type**: Date (datetime)
- **Purpose**: Event start date and time
- **Constraints**: Required, must be valid datetime
- **Business Rules**: 
  - Must be before endDate
  - Can be in past or future (within reasonable range)

### endDate
- **Type**: Date (datetime)
- **Purpose**: Event end date and time
- **Constraints**: Required, must be valid datetime
- **Business Rules**:
  - Must be after startDate
  - Can be in past or future (within reasonable range)

### createdAt
- **Type**: Date (datetime)
- **Purpose**: Timestamp when event was created
- **Constraints**: Auto-generated on creation, immutable

### updatedAt
- **Type**: Date (datetime)
- **Purpose**: Timestamp when event was last modified
- **Constraints**: Auto-updated on modification

## Validation Rules

### Creation Rules
1. `title` MUST be provided and non-empty (trimmed)
2. `title` MUST be 255 characters or less
3. `startDate` MUST be provided and valid datetime
4. `endDate` MUST be provided and valid datetime
5. `endDate` MUST be after `startDate`
6. `userId` MUST match authenticated user
7. `description` is optional but if provided, must be non-empty when trimmed

### Update Rules
1. All creation rules apply
2. Event MUST exist (id must be valid)
3. User MUST own the event (userId must match authenticated user)

### Query Rules
1. Date range queries MUST have valid start and end dates
2. Date range MUST not exceed 1 year span
3. Events are filtered by authenticated user's userId

## State Transitions

N/A - CalendarEvent is a simple entity with no state machine. Events are either created, updated, or deleted.

## Relationships

### User (Many-to-One)
- Each CalendarEvent belongs to one User
- Relationship is implicit via `userId` field
- No foreign key constraint needed (user validation happens in application layer)

### No Other Relationships
- CalendarEvent is standalone (per FR-015)
- Not linked to Notes, Tags, or other modules

## Database Schema

```sql
CREATE TABLE calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_date_range ON calendar_events(start_date, end_date);
```

## Mapping Between Domain and Infrastructure

### Domain → Infrastructure
- Domain entity fields map directly to infrastructure entity columns
- Date objects are stored as DATETIME in SQLite
- Optional fields use nullable columns

### Infrastructure → Domain
- TypeORM entity is converted to domain entity in repository
- All datetime columns converted to JavaScript Date objects
- Nullable fields converted to optional TypeScript properties

## Edge Cases Handled

1. **Events spanning multiple days**: Handled by storing full datetime for start and end
2. **Events in same time slot**: No database constraint - handled in UI display logic
3. **Past events**: Allowed - users may want to see historical calendar data
4. **Very long events**: No duration limit - endDate can be far in future
5. **Timezone differences**: Stored as UTC, converted in application layer

