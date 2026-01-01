# Implementation Plan: Recurring Events

**Branch**: `002-recurring-events` | **Date**: 2024-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-recurring-events/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the calendar events module to support recurring events with patterns (daily, weekly, monthly, yearly). Users can create recurring event series, view all instances in the calendar, edit individual instances or the entire series, and delete series with options for past/future instances. The system must handle edge cases like month-end dates, leap years, DST, and preserve individual instance modifications when editing series.

## Technical Context

**Language/Version**: TypeScript 5.1+ with strict mode  
**Primary Dependencies**: 
- Backend: NestJS 10.x, TypeORM 0.3.x, SQLite, date-fns 4.x (for recurrence calculations)
- Frontend: React 18.x, TypeScript, Vite, Material-UI (MUI) 7.x, React Query (TanStack Query) 5.x, date-fns 4.x
**Storage**: SQLite database (development), TypeORM migrations  
**Testing**: Jest for unit and e2e tests  
**Target Platform**: Web application (React frontend, NestJS backend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Generate and display recurring event instances for 3-month view in under 2 seconds
- Support series with 100+ instances without performance degradation
- API endpoints respond in under 200ms p95
**Constraints**: 
- Must follow DDD architecture with Transaction Scripts pattern
- Domain layer must be pure TypeScript (no TypeORM decorators)
- All domain logic in Transaction Scripts only
- No `any` types allowed
- Must use existing authentication system
- Must extend existing calendar-events module (not create new module)
- Recurrence calculations must handle edge cases (leap years, month-end, DST)
**Scale/Scope**: 
- Single-user recurring events (series belong to authenticated user)
- Date range queries: past year to next 2 years (for "no end date" series)
- Weekly calendar view as primary interface (must show all instances)
- Support for series with up to 1000 instances per query

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates

- ✅ **I. Domain-Driven Design**: Recurring events will extend the existing calendar-events module following DDD with Application/Domain/Infrastructure layers
- ✅ **II. Transaction Scripts Pattern**: All domain logic will be in Transaction Scripts (create recurring event, generate instances, edit instance, edit series, delete series)
- ✅ **III. Strict TypeScript Typing**: All code will use explicit types, no `any` allowed. Recurrence patterns will have specific types
- ✅ **IV. Dependency Injection Rules**: Actions → Services → Transaction Scripts → Repositories hierarchy will be followed
- ✅ **V. Testing Discipline**: Unit tests for all public functions (especially recurrence calculation logic), e2e tests for API endpoints
- ✅ **VI. Module Structure**: Will extend existing `apps/actions/`, `domain/services/`, `domain/transaction-scripts/`, `infra/repositories/` structure
- ✅ **VII. Domain/Infrastructure Separation**: Domain entities will be pure TypeScript, infrastructure entities will have TypeORM decorators. Recurrence data stored separately from event instances

**Status**: All gates pass. Ready for Phase 0 research.

### Post-Design Gates (re-evaluated after Phase 1)

- ✅ **I. Domain-Driven Design**: Module structure follows DDD boundaries (apps/actions/, domain/, infra/) - Extends existing calendar-events module
- ✅ **II. Transaction Scripts Pattern**: All business logic designed in Transaction Scripts (create, generate instances, update instance, update series, delete series)
- ✅ **III. Strict TypeScript Typing**: Data model uses explicit types (RecurringEvent, EventInstance, RecurrenceException, RecurrencePattern), no `any` types in design
- ✅ **IV. Dependency Injection Rules**: Dependency hierarchy verified (Actions → Services → Transaction Scripts → Repositories)
- ✅ **V. Testing Discipline**: Test structure follows constitution (unit tests for Transaction Scripts, e2e for Actions)
- ✅ **VI. Module Structure**: File organization matches constitution (actions in folders, DTOs in subfolders)
- ✅ **VII. Domain/Infrastructure Separation**: Domain entities are pure TypeScript (RecurringEvent, EventInstance), infrastructure entities have TypeORM decorators (RecurringEventEntity, EventInstanceEntity)

**Status**: All post-design gates pass. Ready for task generation.

## Project Structure

### Documentation (this feature)

```text
specs/002-recurring-events/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── create-recurring-event.yaml
│   ├── update-recurring-event-instance.yaml
│   ├── update-recurring-event-series.yaml
│   └── delete-recurring-event-series.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   └── calendar-events/  # Extending existing module
│       ├── apps/
│       │   └── actions/
│       │       ├── create-recurring-event-action/
│       │       │   ├── create-recurring-event.action.ts
│       │       │   ├── create-recurring-event.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── create-recurring-event.dto.ts
│       │       ├── update-recurring-event-instance-action/
│       │       │   ├── update-recurring-event-instance.action.ts
│       │       │   ├── update-recurring-event-instance.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── update-recurring-event-instance.dto.ts
│       │       ├── delete-recurring-event-instance-action/
│       │       │   ├── delete-recurring-event-instance.action.ts
│       │       │   ├── delete-recurring-event-instance.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── delete-recurring-event-instance.dto.ts
│       │       ├── update-recurring-event-series-action/
│       │       │   ├── update-recurring-event-series.action.ts
│       │       │   ├── update-recurring-event-series.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── update-recurring-event-series.dto.ts
│       │       └── delete-recurring-event-series-action/
│       │           ├── delete-recurring-event-series.action.ts
│       │           ├── delete-recurring-event-series.swagger.ts
│       │           └── dtos/
│       │               └── requests/
│       │                   └── delete-recurring-event-series.dto.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── recurring-event.entity.ts  # Domain entity
│       │   │   ├── event-instance.entity.ts   # Domain entity
│       │   │   └── recurrence-pattern.value-object.ts  # Value object
│       │   ├── services/
│       │   │   └── recurring-event.service.ts
│       │   └── transaction-scripts/
│       │       ├── create-recurring-event-TS/
│       │       │   └── create-recurring-event.transaction.script.ts
│       │       ├── generate-event-instances-TS/
│       │       │   └── generate-event-instances.transaction.script.ts
│       │       ├── update-event-instance-TS/
│       │       │   └── update-event-instance.transaction.script.ts
│       │       ├── update-recurring-series-TS/
│       │       │   └── update-recurring-series.transaction.script.ts
│       │       └── delete-recurring-series-TS/
│       │           └── delete-recurring-series.transaction.script.ts
│       └── infra/
│           ├── entities/
│           │   ├── recurring-event.entity.ts  # TypeORM entity
│           │   ├── event-instance.entity.ts  # TypeORM entity
│           │   └── recurrence-exception.entity.ts  # TypeORM entity
│           └── repositories/
│               ├── recurring-event.repository.ts
│               ├── event-instance.repository.ts
│               └── recurrence-exception.repository.ts

frontend/
├── src/
│   └── pages/
│       └── CalendarPage/
│           ├── components/
│           │   ├── CreateEventModal/
│           │   │   └── CreateEventModal.tsx  # Extend to support recurrence
│           │   ├── EventDetailsModal/
│           │   │   └── EventDetailsModal.tsx  # Extend to show recurrence info
│           │   └── RecurrencePatternForm/
│           │       ├── RecurrencePatternForm.tsx  # New component
│           │       └── RecurrencePatternForm.module.css
│           ├── hooks/
│           │   ├── useRecurringEvents.ts  # New hook
│           │   └── useEventInstances.ts   # New hook
│           └── utils/
│               └── recurrence.utils.ts  # Recurrence calculation utilities
```

**Structure Decision**: Extending existing `calendar-events` module rather than creating new module. Recurring events are a feature of calendar events, not a separate domain. New entities (RecurringEvent, EventInstance) extend the calendar event concept.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Outline & Research

### Research Questions

1. **Recurrence Pattern Storage Strategy** ✅ RESOLVED
   - Question: Should we store recurrence patterns separately and generate instances on-demand, or pre-generate all instances?
   - Decision: **Store patterns separately, generate instances on-demand** - See research.md for rationale

2. **Recurrence Calculation Library** ✅ RESOLVED
   - Question: Should we use a library like `rrule` or implement custom recurrence logic?
   - Decision: **Use `rrule` library (RFC 5545 standard)** - Handles all edge cases, industry standard

3. **Individual Instance Modifications Storage** ✅ RESOLVED
   - Question: How should we store modifications to individual instances (separate table, JSON field, or denormalized)?
   - Decision: **Separate `event_instances` table** - Clean data model, preserves series integrity

4. **Edge Case Handling Strategy** ✅ RESOLVED
   - Question: How should we handle month-end dates (e.g., Feb 30th), leap years, and DST?
   - Decision: **Use rrule library** - Handles all edge cases automatically per RFC 5545

5. **"No End Date" Series Limit** ✅ RESOLVED
   - Question: What is a reasonable future period limit for generating instances (2 years? 5 years?)?
   - Decision: **Generate 2 years ahead by default, dynamic for calendar view** - Balances performance and user needs

6. **Recurrence Intervals (MVP vs Future)** ✅ RESOLVED
   - Question: Are recurrence intervals (every 2 weeks, every 3 months) required for MVP?
   - Decision: **Defer to post-MVP** - Focus on basic patterns (daily/weekly/monthly/yearly) for MVP

## Phase 1: Design Artifacts ✅ COMPLETE

### Data Model ✅

- **RecurringEvent entity**: Stores recurrence pattern and metadata (see data-model.md)
- **EventInstance entity**: Stores individual occurrences, supports modifications (see data-model.md)
- **RecurrenceException entity**: Stores skipped/deleted instances (see data-model.md)
- **RecurrencePattern value object**: Pattern configuration (DAILY/WEEKLY/MONTHLY/YEARLY)

**Key Design Decisions**:
- Store patterns separately, generate instances on-demand
- Use rrule library (RFC 5545) for recurrence calculations
- Separate table for modified instances preserves series integrity
- Support for individual instance overrides (title, description, time)

### API Contracts ✅

- **POST `/calendar-events/recurring`** - Create recurring event (see contracts/create-recurring-event.yaml)
- **PUT `/calendar-events/recurring/:id/instances/:instanceId`** - Update individual instance (see contracts/update-recurring-event-instance.yaml)
- **DELETE `/calendar-events/recurring/:id/instances/:instanceId`** - Delete individual instance (see contracts/delete-recurring-event-instance.yaml)
- **PUT `/calendar-events/recurring/:id/series`** - Update entire series (see contracts/update-recurring-event-series.yaml)
- **DELETE `/calendar-events/recurring/:id`** - Delete series with options (see contracts/delete-recurring-event-series.yaml)

**Key Design Decisions**:
- RESTful endpoints following existing calendar-events pattern
- Query parameter for delete options (all/future/past)
- Separate endpoints for instance vs series updates
- All endpoints require authentication

### Quickstart Scenarios ✅

10 test scenarios covering:
- Creating recurring events (daily, weekly, monthly)
- Editing individual instances
- Editing entire series
- Deleting instances and series
- Edge cases (month-end dates, leap years)
- Calendar view with multiple recurring events

See quickstart.md for detailed scenarios.

## Phase 2: Task Generation

*This phase is handled by `/speckit.tasks` command, not `/speckit.plan`*

