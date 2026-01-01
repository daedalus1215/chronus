# Implementation Plan: Calendar Events

**Branch**: `001-calendar-events` | **Date**: 2024-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-calendar-events/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a standalone calendar module with weekly calendar view displaying events organized by day and time slots. Users can view, create, and update calendar events through a React frontend page with modal forms. Backend provides REST API endpoints for CRUD operations on calendar events. Calendar events are independent entities, not tied to notes or other modules.

## Technical Context

**Language/Version**: TypeScript 5.1+ with strict mode  
**Primary Dependencies**: 
- Backend: NestJS 10.x, TypeORM 0.3.x, SQLite
- Frontend: React 18.x, TypeScript, Vite, Material-UI (MUI) 7.x, React Query (TanStack Query) 5.x
**Storage**: SQLite database (development), TypeORM migrations  
**Testing**: Jest for unit and e2e tests  
**Target Platform**: Web application (React frontend, NestJS backend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Calendar page loads in under 2 seconds
- Support 50+ events per week without degradation
- API endpoints respond in under 200ms p95
**Constraints**: 
- Must follow DDD architecture with Transaction Scripts pattern
- Domain layer must be pure TypeScript (no TypeORM decorators)
- All domain logic in Transaction Scripts only
- No `any` types allowed
- Must use existing authentication system
**Scale/Scope**: 
- Single-user calendar events (events belong to authenticated user)
- Date range queries: past year to next year
- Weekly calendar view as primary interface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates

- ✅ **I. Domain-Driven Design**: Calendar events will be a standalone module following DDD with Application/Domain/Infrastructure layers
- ✅ **II. Transaction Scripts Pattern**: All domain logic will be in Transaction Scripts (create, fetch, update calendar event)
- ✅ **III. Strict TypeScript Typing**: All code will use explicit types, no `any` allowed
- ✅ **IV. Dependency Injection Rules**: Actions → Services → Transaction Scripts → Repositories hierarchy will be followed
- ✅ **V. Testing Discipline**: Unit tests for all public functions, e2e tests for API endpoints
- ✅ **VI. Module Structure**: Will follow `apps/actions/`, `domain/services/`, `domain/transaction-scripts/`, `infra/repositories/` structure
- ✅ **VII. Domain/Infrastructure Separation**: Domain entities will be pure TypeScript, infrastructure entities will have TypeORM decorators

**Status**: All gates pass. Ready for Phase 0 research.

### Post-Design Gates (re-evaluated after Phase 1)

- ✅ **I. Domain-Driven Design**: Module structure follows DDD boundaries (apps/actions/, domain/, infra/)
- ✅ **II. Transaction Scripts Pattern**: All business logic designed in Transaction Scripts (create, fetch, update)
- ✅ **III. Strict TypeScript Typing**: Data model uses explicit types, no `any` types in design
- ✅ **IV. Dependency Injection Rules**: Dependency hierarchy verified (Actions → Services → Transaction Scripts → Repositories)
- ✅ **V. Testing Discipline**: Test structure follows constitution (unit tests for Transaction Scripts, e2e for Actions)
- ✅ **VI. Module Structure**: File organization matches constitution (actions in folders, DTOs in subfolders)
- ✅ **VII. Domain/Infrastructure Separation**: Domain entities are pure TypeScript, infrastructure entities have TypeORM decorators

**Status**: All post-design gates pass. Ready for task generation.

## Project Structure

### Documentation (this feature)

```text
specs/001-calendar-events/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── create-calendar-event.yaml
│   ├── fetch-calendar-events.yaml
│   ├── fetch-calendar-event.yaml
│   └── update-calendar-event.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   └── calendar-events/
│       ├── apps/
│       │   └── actions/
│       │       ├── create-calendar-event-action/
│       │       │   ├── create-calendar-event.action.ts
│       │       │   ├── create-calendar-event.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── create-calendar-event.dto.ts
│       │       ├── fetch-calendar-events-action/
│       │       │   ├── fetch-calendar-events.action.ts
│       │       │   ├── fetch-calendar-events.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── fetch-calendar-events.dto.ts
│       │       ├── fetch-calendar-event-action/
│       │       │   ├── fetch-calendar-event.action.ts
│       │       │   ├── fetch-calendar-event.swagger.ts
│       │       │   └── dtos/
│       │       │       └── requests/
│       │       │           └── fetch-calendar-event.dto.ts
│       │       └── update-calendar-event-action/
│       │           ├── update-calendar-event.action.ts
│       │           ├── update-calendar-event.swagger.ts
│       │           └── dtos/
│       │               └── requests/
│       │                   └── update-calendar-event.dto.ts
│       ├── apps/
│       │   └── dtos/
│       │       └── responses/
│       │           └── calendar-event.response.dto.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   └── calendar-event.entity.ts
│       │   ├── services/
│       │   │   └── calendar-event.service.ts
│       │   └── transaction-scripts/
│       │       ├── create-calendar-event-TS/
│       │       │   └── create-calendar-event.transaction.script.ts
│       │       ├── fetch-calendar-events-TS/
│       │       │   └── fetch-calendar-events.transaction.script.ts
│       │       ├── fetch-calendar-event-TS/
│       │       │   └── fetch-calendar-event.transaction.script.ts
│       │       └── update-calendar-event-TS/
│       │           └── update-calendar-event.transaction.script.ts
│       ├── infra/
│       │   ├── entities/
│       │   │   └── calendar-event.entity.ts
│       │   └── repositories/
│       │       └── calendar-event.repository.ts
│       └── calendar-events.module.ts

frontend/
├── src/
│   ├── pages/
│   │   └── CalendarPage/
│   │       ├── CalendarPage.tsx
│   │       ├── CalendarPage.module.css
│   │       ├── components/
│   │       │   ├── CalendarView/
│   │       │   │   ├── CalendarView.tsx
│   │       │   │   └── CalendarView.module.css
│   │       │   ├── CreateEventModal/
│   │       │   │   ├── CreateEventModal.tsx
│   │       │   │   └── CreateEventModal.module.css
│   │       │   └── EventDetailsModal/
│   │       │       ├── EventDetailsModal.tsx
│   │       │       └── EventDetailsModal.module.css
│   │       └── hooks/
│   │           ├── useCalendarEvents.ts
│   │           ├── useCreateCalendarEvent.ts
│   │           └── useUpdateCalendarEvent.ts
│   └── api/
│       └── calendar-events/
│           ├── requests.ts
│           └── responses.ts
```

**Structure Decision**: Web application structure with separate backend and frontend. Backend follows existing module pattern (time-tracks, notes, tags). Frontend follows existing page structure (HomePage, NotePage, TagPage). Calendar events module is standalone, not integrated with notes module.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all architecture patterns align with constitution.

