# Research: Calendar Events Feature

**Date**: 2024-12-30  
**Feature**: Calendar Events  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Calendar Library Selection for React Weekly View

**Question**: What React library should we use for displaying a weekly calendar view with time slots, or should we build from scratch?

**Decision**: Evaluate popular React calendar libraries that support weekly views with time slots.

**Research Findings**:

**Option A: react-big-calendar**
- Pros: Mature library, supports week view, time slots, event rendering, drag-and-drop
- Cons: Requires moment.js or date-fns (we already use date-fns), may be overkill for simple use case
- License: MIT
- Maintenance: Active (regular updates)

**Option B: @fullcalendar/react**
- Pros: Feature-rich, supports multiple views including week view, time slots, event interactions
- Cons: Larger bundle size, more complex API, may have more features than needed
- License: MIT
- Maintenance: Very active

**Option C: Custom Implementation with MUI**
- Pros: Full control, matches existing MUI design system, smaller bundle, no external dependencies
- Cons: More development time, need to handle all calendar logic (date calculations, time slots, event positioning)
- License: N/A (our code)
- Maintenance: We maintain it

**Option D: react-calendar-timeline**
- Pros: Built specifically for timeline/weekly views, good for time slot rendering
- Cons: Less flexible, may not match design requirements exactly
- License: MIT
- Maintenance: Moderate

**Decision**: **Custom Implementation with MUI** (Option C)

**Rationale**: 
- We already use MUI throughout the application, ensuring design consistency
- The weekly calendar view is relatively straightforward to implement
- Custom implementation gives us full control over event positioning, styling, and interactions
- Smaller bundle size (no additional calendar library dependency)
- Can leverage existing MUI components (Grid, Paper, Typography, Modal)
- The image shows a clean, simple weekly view that doesn't require complex calendar library features

**Alternatives Considered**: 
- react-big-calendar: Too feature-rich for our needs, adds unnecessary complexity
- @fullcalendar/react: Large bundle size, more than we need
- react-calendar-timeline: Good but less flexible for custom styling

### 2. Date/Time Handling

**Question**: How should we handle dates and times in the backend and frontend?

**Decision**: Use standard JavaScript Date objects with date-fns for manipulation.

**Rationale**:
- Backend already uses TypeORM with date/time column types
- Frontend already uses date-fns (seen in package.json dependencies)
- date-fns provides timezone-aware utilities if needed later
- Simple, no additional dependencies required

**Alternatives Considered**:
- moment.js: Deprecated, date-fns is preferred
- dayjs: Lightweight but we already have date-fns

### 3. Event Overlap Handling

**Question**: How should we handle multiple events in the same time slot?

**Decision**: Display events side-by-side or stacked vertically, with visual indicators for overlap.

**Rationale**:
- Common pattern in calendar applications
- Users can see all events even if they overlap,
- Visual indicators (opacity, borders) help identify overlaps
- No complex collision detection needed for MVP

**Implementation Approach**:
- Calculate event positions based on start time and duration
- If events overlap, adjust width and position to show both
- Use visual styling (opacity, borders) to indicate overlaps
- For many overlapping events, consider vertical scrolling in time slot

### 4. Timezone Handling

**Question**: How should we handle timezones?

**Decision**: Store all times in UTC, display in user's local timezone.

**Rationale**:
- Standard practice for web applications
- Backend stores UTC, frontend converts to local time for display
- date-fns supports timezone conversions if needed
- For MVP, assume single timezone (user's browser timezone)

**Future Consideration**: If multi-timezone support is needed, store user's timezone preference and convert accordingly.

### 5. Date Range Queries

**Question**: How should we structure date range queries for fetching events?

**Decision**: Use start date and end date parameters in ISO 8601 format.

**Rationale**:
- Standard REST API pattern
- Easy to parse and validate
- Works well with date-fns
- Frontend can calculate week boundaries and pass to backend

**Implementation**:
- GET `/calendar-events?startDate=2024-12-30&endDate=2025-01-05`
- Backend validates date range (max 1 year span)
- Returns all events within range, ordered by start time

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Calendar Library | Custom MUI Implementation | Design consistency, full control, smaller bundle |
| Date/Time Library | date-fns | Already in dependencies, timezone support |
| Event Overlap | Side-by-side/stacked display | Common pattern, visual clarity |
| Timezone | UTC storage, local display | Standard practice, simple for MVP |
| Date Range Format | ISO 8601 (YYYY-MM-DD) | Standard, easy to parse |

## Dependencies to Add

**Frontend**: None (using existing MUI and date-fns)

**Backend**: None (using existing NestJS, TypeORM, SQLite)

## Open Questions Resolved

- ✅ Calendar library: Custom MUI implementation
- ✅ Date handling: date-fns (already in use)
- ✅ Event overlap: Visual stacking with indicators
- ✅ Timezone: UTC storage, local display
- ✅ Date range queries: ISO 8601 format

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create data model for CalendarEvent entity
- Design API contracts for all endpoints
- Create quickstart guide

