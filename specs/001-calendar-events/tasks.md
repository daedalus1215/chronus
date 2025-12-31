# Tasks: Calendar Events

**Input**: Design documents from `/specs/001-calendar-events/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per constitution requirements (unit tests for all public functions, e2e tests for API endpoints).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the web application structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create calendar-events module directory structure in backend/src/calendar-events/
- [x] T002 [P] Create apps/actions/ directory structure in backend/src/calendar-events/apps/actions/
- [x] T003 [P] Create domain/ directory structure in backend/src/calendar-events/domain/
- [x] T004 [P] Create infra/ directory structure in backend/src/calendar-events/infra/
- [x] T005 [P] Create CalendarPage directory structure in frontend/src/pages/CalendarPage/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create database migration for calendar_events table in backend/src/typeorm/migrations/
- [x] T007 [P] Create domain entity CalendarEvent in backend/src/calendar-events/domain/entities/calendar-event.entity.ts
- [x] T008 [P] Create infrastructure entity CalendarEventEntity in backend/src/calendar-events/infra/entities/calendar-event.entity.ts
- [x] T009 Create CalendarEventRepository in backend/src/calendar-events/infra/repositories/calendar-event.repository.ts with methods: create, findByDateRange, findById, update
- [x] T010 Create calendar-events.module.ts in backend/src/calendar-events/calendar-events.module.ts
- [x] T011 Register CalendarEventsModule in backend/src/app.module.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Calendar with Events (Priority: P1) 🎯 MVP

**Goal**: Users can view a weekly calendar displaying their scheduled events organized by day and time slots

**Independent Test**: Navigate to the calendar page and verify that events are displayed in the correct time slots and days. Can be tested independently with mock data or existing events.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Unit test for FetchCalendarEventsTransactionScript in backend/src/calendar-events/domain/transaction-scripts/fetch-calendar-events-TS/__specs__/fetch-calendar-events.transaction.script.spec.ts
- [ ] T013 [P] [US1] E2E test for GET /calendar-events endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T013a [P] [US1] Test case: Verify events spanning multiple hours display correctly in CalendarView (FR-014) in frontend/src/pages/CalendarPage/components/CalendarView/__specs__/CalendarView.spec.tsx

### Implementation for User Story 1

- [x] T014 [P] [US1] Create FetchCalendarEventsTransactionScript in backend/src/calendar-events/domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script.ts
- [x] T015 [US1] Create CalendarEventService in backend/src/calendar-events/domain/services/calendar-event.service.ts (orchestrates Transaction Scripts)
- [x] T016 [US1] Create FetchCalendarEventsAction in backend/src/calendar-events/apps/actions/fetch-calendar-events-action/fetch-calendar-events.action.ts
- [x] T017 [P] [US1] Create FetchCalendarEventsSwagger in backend/src/calendar-events/apps/actions/fetch-calendar-events-action/fetch-calendar-events.swagger.ts
- [x] T018 [P] [US1] Create FetchCalendarEventsRequestDto in backend/src/calendar-events/apps/actions/fetch-calendar-events-action/dtos/requests/fetch-calendar-events.dto.ts
- [x] T019 [P] [US1] Create CalendarEventResponseDto in backend/src/calendar-events/apps/dtos/responses/calendar-event.response.dto.ts
- [x] T020 [US1] Register FetchCalendarEventsAction in backend/src/calendar-events/calendar-events.module.ts
- [x] T021 [P] [US1] Create API client functions in frontend/src/api/requests/calendar-events.requests.ts (fetchCalendarEvents function)
- [x] T022 [P] [US1] Create API response types in frontend/src/api/dtos/calendar-events.dtos.ts
- [x] T023 [P] [US1] Create useCalendarEvents hook in frontend/src/pages/CalendarPage/hooks/useCalendarEvents.ts
- [x] T024 [P] [US1] Create CalendarView component in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx
- [ ] T024a [US1] Implement multi-day event handling in CalendarView: events spanning multiple days should display across day boundaries (edge case clarification) in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx
- [x] T025 [P] [US1] Create CalendarView styles in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.module.css
- [x] T026 [US1] Create CalendarPage component in frontend/src/pages/CalendarPage/CalendarPage.tsx
- [x] T027 [P] [US1] Create CalendarPage styles in frontend/src/pages/CalendarPage/CalendarPage.module.css
- [x] T028 [US1] Add route for CalendarPage in frontend/src/App.tsx
- [x] T029 [P] [US1] Add week navigation controls to CalendarPage (previous/next week buttons) in frontend/src/pages/CalendarPage/CalendarPage.tsx
- [x] T030 [P] [US1] Add current date indicator to CalendarView in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx
- [ ] T031 [P] [US1] Performance test: Verify calendar page loads in under 2 seconds with 50+ events (SC-001, SC-006) in backend/test/calendar-events.e2e-spec.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can navigate to the calendar page, see events displayed in a weekly view, navigate between weeks, and see the current date indicator.

---

## Phase 4: User Story 2 - Create Calendar Event (Priority: P2)

**Goal**: Users can create new calendar events through a modal form with title, date, start time, end time, and optional description

**Independent Test**: Click the create event button, fill out the form, submit, and verify the new event appears on the calendar. Can be tested independently after US1 is complete.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US2] Unit test for CreateCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/create-calendar-event-TS/__specs__/create-calendar-event.transaction.script.spec.ts
- [ ] T033 [P] [US2] E2E test for POST /calendar-events endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T034 [P] [US2] Performance test: Verify event creation completes in under 30 seconds (SC-002) in backend/test/calendar-events.e2e-spec.ts

### Implementation for User Story 2

- [x] T035 [P] [US2] Create CreateCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/create-calendar-event-TS/create-calendar-event.transaction.script.ts
- [x] T036 [US2] Add createCalendarEvent method to CalendarEventService in backend/src/calendar-events/domain/services/calendar-event.service.ts
- [x] T037 [US2] Create CreateCalendarEventAction in backend/src/calendar-events/apps/actions/create-calendar-event-action/create-calendar-event.action.ts
- [x] T038 [P] [US2] Create CreateCalendarEventSwagger in backend/src/calendar-events/apps/actions/create-calendar-event-action/create-calendar-event.swagger.ts
- [x] T039 [P] [US2] Create CreateCalendarEventRequestDto in backend/src/calendar-events/apps/actions/create-calendar-event-action/dtos/requests/create-calendar-event.dto.ts
- [x] T040 [US2] Register CreateCalendarEventAction in backend/src/calendar-events/calendar-events.module.ts
- [x] T041 [P] [US2] Add createCalendarEvent function to frontend/src/api/requests/calendar-events.requests.ts
- [x] T042 [P] [US2] Create useCreateCalendarEvent hook in frontend/src/pages/CalendarPage/hooks/useCreateCalendarEvent.ts
- [x] T043 [P] [US2] Create CreateEventModal component in frontend/src/pages/CalendarPage/components/CreateEventModal/CreateEventModal.tsx
- [x] T044 [P] [US2] Create CreateEventModal styles in frontend/src/pages/CalendarPage/components/CreateEventModal/CreateEventModal.module.css
- [x] T045 [US2] Add create event button to CalendarPage in frontend/src/pages/CalendarPage/CalendarPage.tsx
- [x] T046 [US2] Integrate CreateEventModal with CalendarPage in frontend/src/pages/CalendarPage/CalendarPage.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view the calendar and create new events.

---

## Phase 5: User Story 3 - Update Calendar Event (Priority: P3)

**Goal**: Users can modify existing calendar events by updating their details such as title, time, date, or description

**Independent Test**: Click on an existing event, modify its details, save, and verify the changes appear on the calendar. Can be tested independently after US1 is complete.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T047 [P] [US3] Unit test for FetchCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/fetch-calendar-event-TS/__specs__/fetch-calendar-event.transaction.script.spec.ts
- [ ] T048 [P] [US3] Unit test for UpdateCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-calendar-event-TS/__specs__/update-calendar-event.transaction.script.spec.ts (verify repository.update method is called)
- [ ] T049 [P] [US3] E2E test for GET /calendar-events/:id endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T050 [P] [US3] E2E test for PUT /calendar-events/:id endpoint in backend/test/calendar-events.e2e-spec.ts

### Implementation for User Story 3

- [x] T051 [P] [US3] Create FetchCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.transaction.script.ts
- [x] T052 [P] [US3] Create UpdateCalendarEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-calendar-event-TS/update-calendar-event.transaction.script.ts (must use CalendarEventRepository.update method from T009)
- [x] T053 [US3] Add fetchCalendarEventById and updateCalendarEvent methods to CalendarEventService in backend/src/calendar-events/domain/services/calendar-event.service.ts
- [x] T054 [US3] Create FetchCalendarEventAction in backend/src/calendar-events/apps/actions/fetch-calendar-event-action/fetch-calendar-event.action.ts
- [x] T055 [P] [US3] Create FetchCalendarEventSwagger in backend/src/calendar-events/apps/actions/fetch-calendar-event-action/fetch-calendar-event.swagger.ts
- [x] T056 [P] [US3] Create FetchCalendarEventRequestDto in backend/src/calendar-events/apps/actions/fetch-calendar-event-action/dtos/requests/fetch-calendar-event.dto.ts
- [x] T057 [US3] Create UpdateCalendarEventAction in backend/src/calendar-events/apps/actions/update-calendar-event-action/update-calendar-event.action.ts
- [x] T058 [P] [US3] Create UpdateCalendarEventSwagger in backend/src/calendar-events/apps/actions/update-calendar-event-action/update-calendar-event.swagger.ts
- [x] T059 [P] [US3] Create UpdateCalendarEventRequestDto in backend/src/calendar-events/apps/actions/update-calendar-event-action/dtos/requests/update-calendar-event.dto.ts
- [x] T060 [US3] Register FetchCalendarEventAction and UpdateCalendarEventAction in backend/src/calendar-events/calendar-events.module.ts
- [x] T061 [P] [US3] Add fetchCalendarEvent and updateCalendarEvent functions to frontend/src/api/requests/calendar-events.requests.ts
- [x] T062 [P] [US3] Create useUpdateCalendarEvent hook in frontend/src/pages/CalendarPage/hooks/useUpdateCalendarEvent.ts
- [x] T063 [P] [US3] Create EventDetailsModal component in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [x] T064 [P] [US3] Create EventDetailsModal styles in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.module.css
- [x] T065 [US3] Integrate EventDetailsModal with CalendarView to show event details on click in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx
- [x] T066 [US3] Add edit functionality to EventDetailsModal in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx

**Checkpoint**: All user stories should now be independently functional. Users can view, create, and update calendar events.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Add JSDoc documentation to all public classes and methods in backend/src/calendar-events/
- [ ] T068 [P] Add JSDoc documentation to all public components and hooks in frontend/src/pages/CalendarPage/
- [ ] T069 [P] Code cleanup and refactoring across calendar-events module
- [ ] T070 [P] Performance optimization: optimize date range queries, add caching if needed
- [ ] T071 [P] Add error handling and loading states to all frontend components
- [ ] T072 [P] Add validation error messages to CreateEventModal and EventDetailsModal
- [ ] T073 [P] Implement event overlap visualization in CalendarView component
- [ ] T074 [P] Add responsive design for mobile devices
- [ ] T075 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for calendar display, but can be implemented independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for calendar display, but can be implemented independently

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Domain entities before repositories
- Repositories before transaction scripts
- Transaction scripts before services
- Services before actions
- Actions before frontend API clients
- API clients before hooks
- Hooks before components
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Domain entities and infrastructure entities marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Frontend and backend tasks within a story can run in parallel after API contracts are defined

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for FetchCalendarEventsTransactionScript"
Task: "E2E test for GET /calendar-events endpoint"

# Launch all parallel tasks for User Story 1 together:
Task: "Create FetchCalendarEventsSwagger"
Task: "Create FetchCalendarEventsRequestDto"
Task: "Create CalendarEventResponseDto"
Task: "Create API client functions"
Task: "Create API response types"
Task: "Create useCalendarEvents hook"
Task: "Create CalendarView component"
Task: "Create CalendarView styles"
Task: "Create CalendarPage styles"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend + frontend)
   - Developer B: User Story 2 (backend + frontend)
   - Developer C: User Story 3 (backend + frontend)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Follow constitution: All domain logic in Transaction Scripts, no business logic in Services or Actions
- Follow constitution: Domain entities are pure TypeScript, infrastructure entities have TypeORM decorators
- Follow constitution: All public functions must have unit tests, all API endpoints must have e2e tests
- **Edge Case Handling**: Multi-day events are handled by datetime storage (startDate/endDate), but UI display logic in CalendarView must explicitly handle events that span across day boundaries (task T024a)
- **Repository Method Usage**: CalendarEventRepository.update method (created in T009) is used by UpdateCalendarEventTransactionScript (T052) - verified in test T048

