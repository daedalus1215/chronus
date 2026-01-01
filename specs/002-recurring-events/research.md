# Research: Recurring Events Feature

**Date**: 2024-12-30  
**Feature**: Recurring Events  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Recurrence Pattern Storage Strategy

**Question**: Should we store recurrence patterns separately and generate instances on-demand, or pre-generate all instances?

**Decision**: **Store patterns separately, generate instances on-demand**

**Research Findings**:

**Option A: Pre-generate All Instances**
- Pros: Simple queries, fast calendar display, no runtime calculation
- Cons: Massive storage for long series, difficult to update series (need to regenerate all), storage bloat for "no end date" series
- Storage: For daily event over 2 years = 730+ records per series
- Update Complexity: High (must regenerate all instances when pattern changes)

**Option B: Store Pattern, Generate On-Demand**
- Pros: Minimal storage (one pattern record), easy to update series (change pattern, regenerate), handles "no end date" elegantly
- Cons: Runtime calculation overhead, more complex queries
- Storage: One pattern record per series regardless of duration
- Update Complexity: Low (change pattern, instances regenerate automatically)

**Option C: Hybrid (Pre-generate + Pattern Storage)**
- Pros: Fast queries for common cases, flexible for updates
- Cons: Most complex, dual storage, sync issues
- Storage: Pattern + instances
- Update Complexity: Medium (must sync pattern and instances)

**Decision**: **Option B - Store Pattern, Generate On-Demand**

**Rationale**: 
- Storage efficiency: One pattern record vs hundreds/thousands of instance records
- Update simplicity: Change pattern once, instances regenerate automatically
- Handles "no end date" elegantly: Generate instances for visible date range only
- Performance acceptable: Generate instances for 3-month view is fast with date-fns
- Aligns with calendar view: We only need instances for visible date range anyway

**Implementation**: Store `RecurringEvent` with pattern, generate `EventInstance` records on-demand when fetching calendar events for a date range.

---

### 2. Recurrence Calculation Library

**Question**: Should we use a library like `rrule` or implement custom recurrence logic?

**Decision**: **Use `rrule` library for recurrence calculations**

**Research Findings**:

**Option A: rrule (RFC 5545 iCalendar standard)**
- Pros: Industry standard (RFC 5545), battle-tested, handles all edge cases (leap years, month-end, DST), supports complex patterns, well-maintained
- Cons: Additional dependency (~50KB), learning curve for API
- License: BSD-3-Clause
- Maintenance: Very active (used by Google Calendar, Outlook)
- Edge Case Support: Excellent (handles all calendar edge cases)

**Option B: date-fns (recurrence addon)**
- Pros: Already in project, familiar API
- Cons: No built-in recurrence support, would need custom implementation, must handle all edge cases ourselves
- License: MIT
- Maintenance: Active but no recurrence features

**Option C: Custom Implementation**
- Pros: Full control, no dependencies
- Cons: Must implement all edge cases (leap years, month-end dates, DST, timezone changes), high complexity, error-prone, maintenance burden
- License: N/A
- Maintenance: We maintain it

**Decision**: **Option A - Use `rrule` library**

**Rationale**:
- Industry standard ensures compatibility and correctness
- Handles all edge cases we identified (leap years, month-end, DST) out of the box
- Well-tested and maintained (used by major calendar applications)
- Worth the dependency for correctness and reduced maintenance
- Can still use date-fns for date formatting and manipulation

**Implementation**: Install `rrule` package, use `RRule` class to generate recurrence instances, store pattern as RRule string or structured data.

---

### 3. Individual Instance Modifications Storage

**Question**: How should we store modifications to individual instances (separate table, JSON field, or denormalized)?

**Decision**: **Separate table for modified instances**

**Research Findings**:

**Option A: Separate EventInstance Table**
- Pros: Clean separation, easy queries, preserves original series, can query modified instances separately
- Cons: More tables, join required for calendar view
- Schema: `event_instances` table with `recurring_event_id`, `instance_date`, `is_modified`, override fields
- Query Complexity: Join recurring_events and event_instances

**Option B: JSON Field in RecurringEvent**
- Pros: Single table, no joins
- Cons: Difficult to query, not normalized, hard to index, SQLite JSON support limited
- Schema: `recurring_events.modified_instances` JSON field
- Query Complexity: JSON parsing required

**Option C: Denormalized CalendarEvent Records**
- Pros: Simple queries, reuses existing calendar_events table
- Cons: Breaks normalization, hard to distinguish series vs instances, update series becomes complex
- Schema: Store each instance as separate calendar_event with `recurring_event_id`
- Query Complexity: Simple but breaks data model

**Decision**: **Option A - Separate EventInstance Table**

**Rationale**:
- Clean data model: RecurringEvent stores pattern, EventInstance stores individual occurrences
- Easy to query: "Get all instances for date range" is straightforward
- Preserves series: Original pattern remains intact
- Modified instances clearly marked with `is_modified` flag
- Follows DDD: EventInstance is a distinct entity with its own lifecycle
- TypeORM handles joins efficiently

**Implementation**: 
- `event_instances` table: `id`, `recurring_event_id`, `instance_date`, `is_modified`, `start_time_override`, `end_time_override`, `title_override`, `description_override`
- Generate instances on-demand, store modified instances permanently
- Use `RecurrenceException` table for deleted/skipped instances

---

### 4. Edge Case Handling Strategy

**Question**: How should we handle month-end dates (e.g., Feb 30th), leap years, and DST?

**Decision**: **Use rrule library which handles all edge cases automatically**

**Research Findings**:

**Edge Case 1: Month-End Dates (e.g., Monthly on 31st)**
- Problem: February only has 28/29 days, some months have 30 days
- rrule Solution: `BYMONTHDAY=31` with `BYMONTHDAY=-1` fallback (last day of month)
- Custom Solution: Would need complex logic to handle "last day" vs "31st" vs "30th"

**Edge Case 2: Leap Years**
- Problem: February 29th only exists in leap years
- rrule Solution: Handles automatically with `BYMONTHDAY=29` and `BYMONTH=2`
- Custom Solution: Would need leap year detection and fallback logic

**Edge Case 3: Daylight Saving Time (DST)**
- Problem: Time shifts when DST changes, recurring events at same "clock time" may shift
- rrule Solution: Uses UTC internally, timezone conversion handled separately
- Custom Solution: Would need timezone library and DST transition handling

**Edge Case 4: Timezone Changes**
- Problem: User changes timezone, recurring events should maintain relative times
- rrule Solution: Store pattern in UTC, convert to user timezone on display
- Custom Solution: Complex timezone conversion logic required

**Decision**: **Use rrule library for all edge case handling**

**Rationale**:
- rrule implements RFC 5545 which defines standard behavior for all edge cases
- Battle-tested in production calendar applications
- Reduces risk of bugs in edge case handling
- Maintains consistency with industry standards

**Implementation**: 
- Store recurrence patterns using rrule format
- Generate instances using `RRule.between()` for date ranges
- Handle timezone conversion in application layer (date-fns-tz or similar)

---

### 5. "No End Date" Series Limit

**Question**: What is a reasonable future period limit for generating instances (2 years? 5 years?)?

**Decision**: **Generate instances for 2 years ahead, with option to extend**

**Research Findings**:

**Option A: 1 Year Ahead**
- Pros: Fast generation, minimal storage
- Cons: Users may need to see further ahead, requires frequent regeneration
- Use Case: Short-term planning

**Option B: 2 Years Ahead**
- Pros: Balances performance and user needs, covers most planning horizons
- Cons: Slightly more storage/computation
- Use Case: Medium-term planning (most common)

**Option C: 5 Years Ahead**
- Pros: Covers long-term planning
- Cons: Significant storage for daily events (1800+ instances), slower generation
- Use Case: Long-term planning (rare)

**Option D: Dynamic (Generate for Visible Range Only)**
- Pros: Always optimal, no arbitrary limit
- Cons: Must regenerate on every calendar navigation
- Use Case: Calendar view navigation

**Decision**: **Option B - 2 Years Ahead with Dynamic Generation for Calendar View**

**Rationale**:
- 2 years covers most user planning needs (annual reviews, long-term projects)
- Performance acceptable: Generating 730 instances (daily) or ~100 instances (weekly) is fast
- Calendar view can generate on-demand for visible range (current week/month)
- Balance between storage and user needs

**Implementation**:
- Default: Generate instances up to 2 years from series start date
- Calendar queries: Generate instances for visible date range only (e.g., current week ± buffer)
- "Extend series" action: Allow users to manually extend if needed

---

### 6. Recurrence Intervals (MVP vs Future)

**Question**: Are recurrence intervals (every 2 weeks, every 3 months) required for MVP?

**Decision**: **Defer to post-MVP, focus on basic patterns first**

**Research Findings**:

**MVP Scope (P1 Features)**:
- Daily recurrence (every day)
- Weekly recurrence (every week, specific days)
- Monthly recurrence (same day of month)
- Yearly recurrence (same date)

**Post-MVP Scope**:
- Interval patterns (every 2 weeks, every 3 months)
- Complex patterns (first Monday of month, last Friday)
- Custom patterns (every N days regardless of week/month boundaries)

**Decision**: **Defer intervals to post-MVP**

**Rationale**:
- Basic patterns (daily/weekly/monthly/yearly) cover 80% of use cases
- Intervals add complexity to UI and validation
- Can be added later without breaking existing functionality
- Focus MVP on core value: creating and viewing recurring events

**Implementation**:
- MVP: Support `FREQ=DAILY`, `FREQ=WEEKLY`, `FREQ=MONTHLY`, `FREQ=YEARLY` with `INTERVAL=1`
- Future: Add `INTERVAL=N` support for all frequencies
- UI: Start with simple pattern selection, add interval controls later

---

## Summary of Decisions

1. **Storage Strategy**: Store recurrence patterns, generate instances on-demand
2. **Recurrence Library**: Use `rrule` (RFC 5545 standard)
3. **Instance Modifications**: Separate `event_instances` table
4. **Edge Cases**: Handled by rrule library automatically
5. **No End Date Limit**: Generate 2 years ahead, dynamic for calendar view
6. **Intervals**: Defer to post-MVP, focus on basic patterns (INTERVAL=1)

## Dependencies to Add

- **Backend**: `rrule` package for recurrence calculations
- **Frontend**: `rrule` package (if needed for client-side generation) or rely on backend
- **Both**: Continue using `date-fns` for date manipulation and formatting

## Open Questions Resolved

- ✅ Recurrence pattern storage: Store patterns, generate on-demand
- ✅ Recurrence library: Use rrule
- ✅ Instance modifications: Separate table
- ✅ Edge cases: Handled by rrule
- ✅ No end date limit: 2 years default, dynamic for calendar
- ✅ Intervals: Defer to post-MVP

## Remaining Clarifications

None - all research questions resolved.

