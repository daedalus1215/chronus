# Quickstart: Calendar Events Feature

**Date**: 2024-12-30  
**Feature**: Calendar Events

## Overview

This guide provides a quick reference for implementing and testing the Calendar Events feature. The feature allows users to view, create, and update calendar events through a weekly calendar interface.

## Architecture Summary

### Backend Module Structure
```
calendar-events/
├── apps/actions/          # HTTP endpoints (Actions)
├── domain/
│   ├── entities/         # Domain entities (pure TypeScript)
│   ├── services/         # Domain services (orchestration)
│   └── transaction-scripts/  # Business logic (Transaction Scripts)
└── infra/
    ├── entities/         # TypeORM entities
    └── repositories/     # Data access
```

### Frontend Structure
```
pages/CalendarPage/
├── CalendarPage.tsx       # Main page component
├── components/
│   ├── CalendarView/      # Weekly calendar display
│   ├── CreateEventModal/  # Create event form
│   └── EventDetailsModal/ # View/edit event
└── hooks/                 # React Query hooks
```

## Key Components

### Backend

1. **Actions** (HTTP Endpoints):
   - `CreateCalendarEventAction` - POST `/calendar-events`
   - `FetchCalendarEventsAction` - GET `/calendar-events?startDate=...&endDate=...`
   - `FetchCalendarEventAction` - GET `/calendar-events/:id`
   - `UpdateCalendarEventAction` - PUT `/calendar-events/:id`

2. **Transaction Scripts** (Business Logic):
   - `CreateCalendarEventTransactionScript` - Validates and creates event
   - `FetchCalendarEventsTransactionScript` - Fetches events in date range
   - `FetchCalendarEventTransactionScript` - Fetches single event
   - `UpdateCalendarEventTransactionScript` - Validates and updates event

3. **Repository** (Data Access):
   - `CalendarEventRepository` - TypeORM queries for calendar events

### Frontend

1. **CalendarPage** - Main page component with calendar view
2. **CalendarView** - Weekly calendar with time slots
3. **CreateEventModal** - Modal form for creating events
4. **EventDetailsModal** - Modal for viewing/editing events
5. **Hooks** - React Query hooks for API calls

## Implementation Checklist

### Backend Setup

- [ ] Create `calendar-events` module directory structure
- [ ] Create domain entity `CalendarEvent` (pure TypeScript)
- [ ] Create infrastructure entity `CalendarEventEntity` (TypeORM)
- [ ] Create database migration for `calendar_events` table
- [ ] Create `CalendarEventRepository` with methods:
  - `create(event: Partial<CalendarEvent>): Promise<CalendarEvent>`
  - `findByDateRange(userId: number, startDate: Date, endDate: Date): Promise<CalendarEvent[]>`
  - `findById(id: number, userId: number): Promise<CalendarEvent | null>`
  - `update(id: number, userId: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent>`
- [ ] Create Transaction Scripts:
  - [ ] `CreateCalendarEventTransactionScript`
  - [ ] `FetchCalendarEventsTransactionScript`
  - [ ] `FetchCalendarEventTransactionScript`
  - [ ] `UpdateCalendarEventTransactionScript`
- [ ] Create `CalendarEventService` (orchestrates Transaction Scripts)
- [ ] Create Actions:
  - [ ] `CreateCalendarEventAction`
  - [ ] `FetchCalendarEventsAction`
  - [ ] `FetchCalendarEventAction`
  - [ ] `UpdateCalendarEventAction`
- [ ] Create DTOs (request/response)
- [ ] Register module in `AppModule`
- [ ] Write unit tests for Transaction Scripts
- [ ] Write e2e tests for API endpoints

### Frontend Setup

- [ ] Create `CalendarPage` component
- [ ] Create `CalendarView` component (weekly view with time slots)
- [ ] Create `CreateEventModal` component
- [ ] Create `EventDetailsModal` component
- [ ] Create API client functions in `api/calendar-events/`
- [ ] Create React Query hooks:
  - [ ] `useCalendarEvents(startDate, endDate)`
  - [ ] `useCreateCalendarEvent()`
  - [ ] `useUpdateCalendarEvent()`
- [ ] Add route for CalendarPage in router
- [ ] Style components with CSS modules
- [ ] Handle loading and error states
- [ ] Implement event positioning logic (time slots)

## Testing Guide

### Backend Tests

1. **Unit Tests** (Transaction Scripts):
   ```typescript
   // Example: create-calendar-event.transaction.script.spec.ts
   describe('CreateCalendarEventTransactionScript', () => {
     it('should create event with valid data', async () => { ... });
     it('should reject event with endDate before startDate', async () => { ... });
     it('should reject event with empty title', async () => { ... });
   });
   ```

2. **E2E Tests** (API Endpoints):
   ```typescript
   // Example: calendar-events.e2e-spec.ts
   describe('POST /calendar-events', () => {
     it('should create event', async () => { ... });
     it('should return 400 for invalid data', async () => { ... });
   });
   ```

### Frontend Tests

1. **Component Tests**:
   - Test CalendarView renders events correctly
   - Test CreateEventModal form validation
   - Test EventDetailsModal displays event data

2. **Integration Tests**:
   - Test full flow: create event → see on calendar → update event

## API Usage Examples

### Create Event
```bash
POST /calendar-events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startDate": "2024-12-30T10:00:00Z",
  "endDate": "2024-12-30T11:00:00Z"
}
```

### Fetch Events (Date Range)
```bash
GET /calendar-events?startDate=2024-12-30&endDate=2025-01-05
Authorization: Bearer <token>
```

### Fetch Single Event
```bash
GET /calendar-events/1
Authorization: Bearer <token>
```

### Update Event
```bash
PUT /calendar-events/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Meeting",
  "startDate": "2024-12-30T14:00:00Z",
  "endDate": "2024-12-30T15:00:00Z"
}
```

## Common Patterns

### Date Range Calculation (Frontend)
```typescript
import { startOfWeek, endOfWeek } from 'date-fns';

const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
```

### Event Positioning (Frontend)
```typescript
// Calculate event position in time slot
const getEventPosition = (event: CalendarEvent) => {
  const startHour = event.startDate.getHours();
  const startMinutes = event.startDate.getMinutes();
  const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60);
  
  return {
    top: (startHour * 60 + startMinutes) * (slotHeight / 60),
    height: duration * (slotHeight / 60)
  };
};
```

## Validation Rules

### Backend Validation
- Title: required, max 255 chars, non-empty when trimmed
- StartDate: required, valid datetime
- EndDate: required, valid datetime, must be after startDate
- Description: optional, non-empty when provided
- UserId: must match authenticated user

### Frontend Validation
- Same as backend, plus:
- Date range queries: max 1 year span
- Time slot validation: events must fit within calendar view

## Error Handling

### Backend Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: User doesn't own event
- `404 Not Found`: Event doesn't exist

### Frontend Errors
- Display error messages in modals
- Show loading states during API calls
- Handle network errors gracefully

## Next Steps

1. Review [data-model.md](./data-model.md) for entity structure
2. Review [contracts/](./contracts/) for API specifications
3. Review [research.md](./research.md) for technical decisions
4. Proceed to [tasks.md](./tasks.md) for implementation tasks

