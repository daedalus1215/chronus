# Tasks: Recurring Events

**Input**: Design documents from `/specs/002-recurring-events/`
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

**Purpose**: Install dependencies and prepare for recurring events feature

- [X] T001 Install rrule package in backend (npm install rrule) in backend/package.json
- [X] T002 [P] Install rrule types in backend (npm install @types/rrule --save-dev) in backend/package.json
- [X] T003 [P] Install rrule package in frontend (npm install rrule) in frontend/package.json (if needed for client-side generation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create database migration for recurring_events table in backend/src/typeorm/migrations/
- [X] T005 [P] Create database migration for event_instances table in backend/src/typeorm/migrations/
- [X] T006 [P] Create database migration for recurrence_exceptions table in backend/src/typeorm/migrations/
- [X] T007 [P] Create domain entity RecurringEvent in backend/src/calendar-events/domain/entities/recurring-event.entity.ts
- [X] T008 [P] Create domain entity EventInstance in backend/src/calendar-events/domain/entities/event-instance.entity.ts
- [X] T009 [P] Create domain entity RecurrenceException in backend/src/calendar-events/domain/entities/recurrence-exception.entity.ts
- [X] T010 [P] Create value object RecurrencePattern in backend/src/calendar-events/domain/entities/recurrence-pattern.value-object.ts
- [X] T011 [P] Create infrastructure entity RecurringEventEntity in backend/src/calendar-events/infra/entities/recurring-event.entity.ts
- [X] T012 [P] Create infrastructure entity EventInstanceEntity in backend/src/calendar-events/infra/entities/event-instance.entity.ts
- [X] T013 [P] Create infrastructure entity RecurrenceExceptionEntity in backend/src/calendar-events/infra/entities/recurrence-exception.entity.ts
- [X] T014 Create RecurringEventRepository in backend/src/calendar-events/infra/repositories/recurring-event.repository.ts with methods: create, findById, update, delete
- [X] T015 [P] Create EventInstanceRepository in backend/src/calendar-events/infra/repositories/event-instance.repository.ts with methods: create, findByRecurringEventId, findByDateRange, findById, update, delete
- [X] T016 [P] Create RecurrenceExceptionRepository in backend/src/calendar-events/infra/repositories/recurrence-exception.repository.ts with methods: create, findByRecurringEventId, delete
- [X] T017 Create utility for rrule pattern conversion in backend/src/calendar-events/domain/utils/rrule-pattern.utils.ts (convert RecurrencePattern to RRule string and vice versa)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Recurring Event (Priority: P1) 🎯 MVP

**Goal**: Users can create calendar events that automatically repeat on a schedule with recurrence patterns (daily, weekly, monthly, yearly)

**Independent Test**: Create a new event with a recurrence pattern, verify the event appears multiple times in the calendar at the correct intervals, and confirm the recurrence settings are saved.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US1] Unit test for CreateRecurringEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/create-recurring-event-TS/__specs__/create-recurring-event.transaction.script.spec.ts
- [X] T019 [P] [US1] Unit test for GenerateEventInstancesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [ ] T020 [P] [US1] E2E test for POST /calendar-events/recurring endpoint in backend/test/calendar-events.e2e-spec.ts
- [X] T021 [P] [US1] Test case: Verify daily recurrence pattern creates instances correctly in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [X] T022 [P] [US1] Test case: Verify weekly recurrence with specific days creates instances correctly in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [X] T023 [P] [US1] Test case: Verify monthly recurrence creates instances correctly in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [X] T024 [P] [US1] Test case: Verify yearly recurrence creates instances correctly in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [X] T025 [P] [US1] Test case: Verify "no end date" series generates instances up to 2 years ahead in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts

### Implementation for User Story 1

- [X] T026 [US1] Create GenerateEventInstancesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/generate-event-instances.transaction.script.ts (uses rrule to generate instances for date range)
- [X] T027 [US1] Create CreateRecurringEventTransactionScript in backend/src/calendar-events/domain/transaction-scripts/create-recurring-event-TS/create-recurring-event.transaction.script.ts (creates recurring event and generates initial instances)
- [X] T028 [US1] Create RecurringEventService in backend/src/calendar-events/domain/services/recurring-event.service.ts (orchestrates Transaction Scripts)
- [X] T029 [US1] Create CreateRecurringEventAction in backend/src/calendar-events/apps/actions/create-recurring-event-action/create-recurring-event.action.ts
- [X] T030 [P] [US1] Create CreateRecurringEventSwagger in backend/src/calendar-events/apps/actions/create-recurring-event-action/create-recurring-event.swagger.ts
- [X] T031 [P] [US1] Create CreateRecurringEventRequestDto in backend/src/calendar-events/apps/actions/create-recurring-event-action/dtos/requests/create-recurring-event.dto.ts
- [X] T032 [P] [US1] Create RecurringEventResponseDto in backend/src/calendar-events/apps/dtos/responses/recurring-event.response.dto.ts
- [X] T033 [US1] Register CreateRecurringEventAction in backend/src/calendar-events/calendar-events.module.ts
- [ ] T034 [P] [US1] Create API client function createRecurringEvent in frontend/src/api/requests/calendar-events.requests.ts
- [ ] T035 [P] [US1] Create API request/response types for recurring events in frontend/src/api/dtos/calendar-events.dtos.ts
- [ ] T036 [P] [US1] Create useCreateRecurringEvent hook in frontend/src/pages/CalendarPage/hooks/useCreateRecurringEvent.ts
- [ ] T037 [US1] Extend CreateEventModal to support recurrence pattern selection in frontend/src/pages/CalendarPage/components/CreateEventModal/CreateEventModal.tsx
- [ ] T038 [P] [US1] Create RecurrencePatternForm component in frontend/src/pages/CalendarPage/components/RecurrencePatternForm/RecurrencePatternForm.tsx
- [ ] T039 [P] [US1] Create RecurrencePatternForm styles in frontend/src/pages/CalendarPage/components/RecurrencePatternForm/RecurrencePatternForm.module.css
- [ ] T040 [US1] Integrate recurrence pattern form into CreateEventModal in frontend/src/pages/CalendarPage/components/CreateEventModal/CreateEventModal.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create recurring events with any pattern (daily/weekly/monthly/yearly) and see them saved in the system.

---

## Phase 4: User Story 2 - View Recurring Event Instances (Priority: P1) 🎯 MVP

**Goal**: Users can see all instances of recurring events displayed in the calendar view, with each instance at its scheduled time

**Independent Test**: Create a recurring event, navigate through different weeks/months in the calendar, and verify all instances appear correctly.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T041 [P] [US2] Unit test for GenerateEventInstancesTransactionScript with date range in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/__specs__/generate-event-instances.transaction.script.spec.ts
- [ ] T042 [P] [US2] E2E test for fetching recurring event instances in date range in backend/test/calendar-events.e2e-spec.ts
- [ ] T043 [P] [US2] Test case: Verify daily recurring event shows on all days in calendar view in frontend/src/pages/CalendarPage/components/CalendarView/__specs__/CalendarView.spec.tsx
- [ ] T044 [P] [US2] Test case: Verify weekly recurring event shows on correct days across multiple weeks in frontend/src/pages/CalendarPage/components/CalendarView/__specs__/CalendarView.spec.tsx
- [ ] T045 [P] [US2] Test case: Verify recurring events display with visual indicator in CalendarView in frontend/src/pages/CalendarPage/components/CalendarView/__specs__/CalendarView.spec.tsx

### Implementation for User Story 2

- [ ] T046 [US2] Extend FetchCalendarEventsTransactionScript to include recurring event instances in backend/src/calendar-events/domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.transaction.script.ts (generate instances for date range)
- [ ] T047 [US2] Update CalendarEventService to handle recurring events in backend/src/calendar-events/domain/services/calendar-event.service.ts
- [ ] T048 [US2] Update FetchCalendarEventsAction to return recurring event instances in backend/src/calendar-events/apps/actions/fetch-calendar-events-action/fetch-calendar-events.action.ts
- [ ] T049 [P] [US2] Update CalendarEventResponseDto to include recurring event information in backend/src/calendar-events/apps/dtos/responses/calendar-event.response.dto.ts
- [ ] T050 [P] [US2] Update useCalendarEvents hook to handle recurring event instances in frontend/src/pages/CalendarPage/hooks/useCalendarEvents.ts
- [ ] T051 [US2] Update CalendarView to display recurring event instances in frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx
- [ ] T052 [P] [US2] Add visual indicator for recurring events in EventCard component in frontend/src/pages/CalendarPage/components/CalendarView/DayColumn/EventCard/EventCard.tsx
- [ ] T053 [P] [US2] Update EventCard styles to show recurring indicator in frontend/src/pages/CalendarPage/components/CalendarView/DayColumn/EventCard/EventCard.module.css
- [ ] T054 [US2] Update EventDetailsModal to show recurrence information in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [ ] T055 [P] [US2] Performance test: Verify calendar page loads in under 2 seconds with 50+ recurring event instances (SC-002) in backend/test/calendar-events.e2e-spec.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create recurring events and see all instances displayed correctly in the calendar view.

---

## Phase 5: User Story 3 - Edit Individual Recurring Event Instance (Priority: P2)

**Goal**: Users can modify a single instance of a recurring event without affecting other instances in the series

**Independent Test**: Create a recurring event, edit one specific instance (changing time, title, or deleting it), and verify only that instance changes while others remain unchanged.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T056 [P] [US3] Unit test for UpdateEventInstanceTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-event-instance-TS/__specs__/update-event-instance.transaction.script.spec.ts
- [ ] T057 [P] [US3] E2E test for PUT /calendar-events/recurring/:id/instances/:instanceId endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T057a [P] [US3] E2E test for DELETE /calendar-events/recurring/:id/instances/:instanceId endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T058 [P] [US3] Test case: Verify editing instance time only affects that instance in backend/src/calendar-events/domain/transaction-scripts/update-event-instance-TS/__specs__/update-event-instance.transaction.script.spec.ts
- [ ] T059 [P] [US3] Test case: Verify deleting instance creates RecurrenceException in backend/src/calendar-events/domain/transaction-scripts/delete-event-instance-TS/__specs__/delete-event-instance.transaction.script.spec.ts

### Implementation for User Story 3

- [ ] T060 [US3] Create UpdateEventInstanceTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-event-instance-TS/update-event-instance.transaction.script.ts
- [ ] T061 [US3] Create DeleteEventInstanceTransactionScript in backend/src/calendar-events/domain/transaction-scripts/delete-event-instance-TS/delete-event-instance.transaction.script.ts (creates RecurrenceException)
- [ ] T062 [US3] Update RecurringEventService to handle instance updates in backend/src/calendar-events/domain/services/recurring-event.service.ts
- [ ] T063 [US3] Create UpdateRecurringEventInstanceAction in backend/src/calendar-events/apps/actions/update-recurring-event-instance-action/update-recurring-event-instance.action.ts
- [ ] T063a [US3] Create DeleteRecurringEventInstanceAction in backend/src/calendar-events/apps/actions/delete-recurring-event-instance-action/delete-recurring-event-instance.action.ts
- [ ] T064 [P] [US3] Create UpdateRecurringEventInstanceSwagger in backend/src/calendar-events/apps/actions/update-recurring-event-instance-action/update-recurring-event-instance.swagger.ts
- [ ] T064a [P] [US3] Create DeleteRecurringEventInstanceSwagger in backend/src/calendar-events/apps/actions/delete-recurring-event-instance-action/delete-recurring-event-instance.swagger.ts
- [ ] T065 [P] [US3] Create UpdateRecurringEventInstanceRequestDto in backend/src/calendar-events/apps/actions/update-recurring-event-instance-action/dtos/requests/update-recurring-event-instance.dto.ts
- [ ] T066 [US3] Register UpdateRecurringEventInstanceAction in backend/src/calendar-events/calendar-events.module.ts
- [ ] T066a [US3] Register DeleteRecurringEventInstanceAction in backend/src/calendar-events/calendar-events.module.ts
- [ ] T067 [P] [US3] Create API client function updateRecurringEventInstance in frontend/src/api/requests/calendar-events.requests.ts
- [ ] T067a [P] [US3] Create API client function deleteRecurringEventInstance in frontend/src/api/requests/calendar-events.requests.ts
- [ ] T068 [P] [US3] Create useUpdateRecurringEventInstance hook in frontend/src/pages/CalendarPage/hooks/useUpdateRecurringEventInstance.ts
- [ ] T068a [P] [US3] Create useDeleteRecurringEventInstance hook in frontend/src/pages/CalendarPage/hooks/useDeleteRecurringEventInstance.ts
- [ ] T069 [US3] Update EventDetailsModal to support editing individual instances in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [ ] T070 [P] [US3] Add "Edit this instance only" option in EventDetailsModal in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [ ] T071 [P] [US3] Add "Delete this instance only" option in EventDetailsModal in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can create recurring events, view instances, and edit individual instances.

---

## Phase 6: User Story 4 - Edit Entire Recurring Series (Priority: P2)

**Goal**: Users can modify all instances of a recurring event series at once, updating all future instances

**Independent Test**: Create a recurring event, edit the series (changing time, pattern, or end date), and verify all future instances reflect the changes while past instances remain unchanged.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T072 [P] [US4] Unit test for UpdateRecurringSeriesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-recurring-series-TS/__specs__/update-recurring-series.transaction.script.spec.ts
- [ ] T073 [P] [US4] E2E test for PUT /calendar-events/recurring/:id/series endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T074 [P] [US4] Test case: Verify editing series preserves individual instance modifications in backend/src/calendar-events/domain/transaction-scripts/update-recurring-series-TS/__specs__/update-recurring-series.transaction.script.spec.ts
- [ ] T075 [P] [US4] Test case: Verify editing series updates all future instances in backend/src/calendar-events/domain/transaction-scripts/update-recurring-series-TS/__specs__/update-recurring-series.transaction.script.spec.ts

### Implementation for User Story 4

- [ ] T076 [US4] Create UpdateRecurringSeriesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/update-recurring-series-TS/update-recurring-series.transaction.script.ts (updates pattern, regenerates future instances, preserves modified instances)
- [ ] T077 [US4] Update RecurringEventService to handle series updates in backend/src/calendar-events/domain/services/recurring-event.service.ts
- [ ] T078 [US4] Create UpdateRecurringEventSeriesAction in backend/src/calendar-events/apps/actions/update-recurring-event-series-action/update-recurring-event-series.action.ts
- [ ] T079 [P] [US4] Create UpdateRecurringEventSeriesSwagger in backend/src/calendar-events/apps/actions/update-recurring-event-series-action/update-recurring-event-series.swagger.ts
- [ ] T080 [P] [US4] Create UpdateRecurringEventSeriesRequestDto in backend/src/calendar-events/apps/actions/update-recurring-event-series-action/dtos/requests/update-recurring-event-series.dto.ts
- [ ] T081 [US4] Register UpdateRecurringEventSeriesAction in backend/src/calendar-events/calendar-events.module.ts
- [ ] T082 [P] [US4] Create API client function updateRecurringEventSeries in frontend/src/api/requests/calendar-events.requests.ts
- [ ] T083 [P] [US4] Create useUpdateRecurringEventSeries hook in frontend/src/pages/CalendarPage/hooks/useUpdateRecurringEventSeries.ts
- [ ] T084 [US4] Update EventDetailsModal to support editing entire series in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [ ] T085 [P] [US4] Add "Edit all future instances" option in EventDetailsModal in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently. Users can create, view, edit individual instances, and edit entire series.

---

## Phase 7: User Story 5 - Delete Recurring Event Series (Priority: P3)

**Goal**: Users can delete an entire recurring event series with options for all instances, only future instances, or only past instances

**Independent Test**: Create a recurring event, delete the series with different options, and verify the correct instances are removed.

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T086 [P] [US5] Unit test for DeleteRecurringSeriesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/delete-recurring-series-TS/__specs__/delete-recurring-series.transaction.script.spec.ts
- [ ] T087 [P] [US5] E2E test for DELETE /calendar-events/recurring/:id endpoint in backend/test/calendar-events.e2e-spec.ts
- [ ] T088 [P] [US5] Test case: Verify delete with "all" option removes all instances in backend/src/calendar-events/domain/transaction-scripts/delete-recurring-series-TS/__specs__/delete-recurring-series.transaction.script.spec.ts
- [ ] T089 [P] [US5] Test case: Verify delete with "future" option only removes future instances in backend/src/calendar-events/domain/transaction-scripts/delete-recurring-series-TS/__specs__/delete-recurring-series.transaction.script.spec.ts

### Implementation for User Story 5

- [ ] T090 [US5] Create DeleteRecurringSeriesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/delete-recurring-series-TS/delete-recurring-series.transaction.script.ts (handles all/future/past options)
- [ ] T091 [US5] Update RecurringEventService to handle series deletion in backend/src/calendar-events/domain/services/recurring-event.service.ts
- [ ] T092 [US5] Create DeleteRecurringEventSeriesAction in backend/src/calendar-events/apps/actions/delete-recurring-event-series-action/delete-recurring-event-series.action.ts
- [ ] T093 [P] [US5] Create DeleteRecurringEventSeriesSwagger in backend/src/calendar-events/apps/actions/delete-recurring-event-series-action/delete-recurring-event-series.swagger.ts
- [ ] T094 [P] [US5] Create DeleteRecurringEventSeriesRequestDto in backend/src/calendar-events/apps/actions/delete-recurring-event-series-action/dtos/requests/delete-recurring-event-series.dto.ts
- [ ] T095 [US5] Register DeleteRecurringEventSeriesAction in backend/src/calendar-events/calendar-events.module.ts
- [ ] T096 [P] [US5] Create API client function deleteRecurringEventSeries in frontend/src/api/requests/calendar-events.requests.ts
- [ ] T097 [P] [US5] Create useDeleteRecurringEventSeries hook in frontend/src/pages/CalendarPage/hooks/useDeleteRecurringEventSeries.ts
- [ ] T098 [US5] Update EventDetailsModal to support deleting series in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx
- [ ] T099 [P] [US5] Add delete confirmation dialog with options (all/future/past) in EventDetailsModal in frontend/src/pages/CalendarPage/components/EventDetailsModal/EventDetailsModal.tsx

**Checkpoint**: At this point, all user stories should be fully functional. Users can create, view, edit instances, edit series, and delete recurring events.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T100 [P] Edge case: Handle month-end dates (e.g., monthly on 31st) in GenerateEventInstancesTransactionScript in backend/src/calendar-events/domain/transaction-scripts/generate-event-instances-TS/generate-event-instances.transaction.script.ts (rrule handles this, but verify)
- [ ] T101 [P] Edge case: Handle leap years for yearly recurrence in GenerateEventInstancesTransactionScript (rrule handles this, but verify)
- [ ] T102 [P] Edge case: Handle DST transitions for recurring events (verify timezone handling)
- [ ] T103 [P] Edge case: Handle recurring events with start date in the past in CreateRecurringEventTransactionScript
- [ ] T104 [P] Performance: Optimize instance generation for large date ranges in GenerateEventInstancesTransactionScript
- [ ] T105 [P] Documentation: Add JSDoc to all public classes and methods
- [ ] T106 [P] Documentation: Update README for calendar-events module to include recurring events
- [ ] T107 [P] Code cleanup: Review and refactor recurring event code
- [ ] T108 [P] Run quickstart.md validation: Test all 10 scenarios from quickstart.md
- [ ] T109 [P] Performance test: Verify system handles series with 100+ instances without degradation (SC-007) in backend/test/calendar-events.e2e-spec.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for creating recurring events to view
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1/US2 for having recurring events to edit
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1/US2 for having recurring events to edit
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Depends on US1/US2 for having recurring events to delete

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Domain entities before infrastructure entities
- Repositories before Transaction Scripts
- Transaction Scripts before Services
- Services before Actions
- Backend before Frontend (for API-dependent features)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Domain entities within a story marked [P] can run in parallel
- Infrastructure entities within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (with coordination)

---

## Parallel Example: User Story 1

```bash
# Launch all domain entities for User Story 1 together:
Task: "Create domain entity RecurringEvent"
Task: "Create domain entity EventInstance"
Task: "Create value object RecurrencePattern"

# Launch all infrastructure entities together:
Task: "Create infrastructure entity RecurringEventEntity"
Task: "Create infrastructure entity EventInstanceEntity"

# Launch all tests together:
Task: "Unit test for CreateRecurringEventTransactionScript"
Task: "Unit test for GenerateEventInstancesTransactionScript"
Task: "E2E test for POST /calendar-events/recurring endpoint"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create Recurring Event)
4. Complete Phase 4: User Story 2 (View Recurring Event Instances)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP Part 1)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP Complete!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create)
   - Developer B: User Story 2 (View) - can start after US1 creates events
   - Developer C: User Story 3 (Edit Instance) - can start after US1/US2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Recurring events extend existing calendar-events module (not separate module)
- rrule library handles all edge cases (leap years, month-end, DST) automatically
- Instance generation is on-demand (not pre-generated) for storage efficiency
- Modified instances are preserved when editing series (FR-008)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

