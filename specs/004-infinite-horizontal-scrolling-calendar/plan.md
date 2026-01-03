# Plan: Infinite Horizontal Scrolling Calendar with Current Day Focus

## Overview

This plan outlines the implementation of infinite horizontal scrolling for the CalendarView component, allowing users to scroll through days continuously without being limited to a single week. Additionally, when the CalendarView is first loaded, it will automatically scroll to and focus on the current day.

## Current Architecture

### Current Implementation
- **Fixed Week View**: Displays exactly 7 days (Monday-Sunday) based on `weekStartDate`
- **Week-based Navigation**: Uses `onPreviousWeek` and `onNextWeek` callbacks to navigate by weeks
- **Event Fetching**: Fetches events for a specific week range via `useCalendarEvents` hook
- **Static Layout**: Days are rendered as a fixed array using `eachDayOfInterval` for the week
- **Header Navigation**: Shows week range and provides Previous/Next/Today buttons

### Key Components
- `CalendarView.tsx`: Main calendar grid component
- `DayColumn.tsx`: Individual day column component
- `useCalendarEvents.ts`: Hook for fetching events for a date range
- `useEventLayouts.ts`: Hook for calculating event layouts per day
- `CalendarPage.tsx`: Parent component managing week state

## Goals

1. **Infinite Horizontal Scrolling**
   - Allow continuous horizontal scrolling through days
   - Dynamically load days as user scrolls
   - Maintain performance with virtual scrolling or efficient rendering
   - Preserve drag-and-drop functionality across all days

2. **Current Day Focus**
   - Automatically scroll to current day on initial mount
   - Highlight current day visually
   - Ensure current day is visible when navigating to "Today"

3. **Backward Compatibility**
   - Maintain existing API contracts
   - Preserve drag-and-drop functionality
   - Keep event creation/editing workflows intact
   - Maintain responsive design for mobile

## Implementation Plan

### Phase 1: Data Structure Refactoring

#### 1.1 Replace Week-based State with Day Range State

**Current State:**
```typescript
// CalendarPage.tsx
const [currentWeek, setCurrentWeek] = useState<Date>(
  startOfWeek(new Date(), { weekStartsOn: 1 }),
);
```

**New State:**
```typescript
// CalendarPage.tsx
type DayRange = {
  startDate: Date;
  endDate: Date;
  visibleStartDate: Date; // First visible day in viewport
  visibleEndDate: Date;   // Last visible day in viewport
};

const [dayRange, setDayRange] = useState<DayRange>(() => {
  const today = new Date();
  const startDate = subDays(today, 30); // Load 30 days before today
  const endDate = addDays(today, 30);   // Load 30 days after today
  return {
    startDate,
    endDate,
    visibleStartDate: startDate,
    visibleEndDate: endDate,
  };
});
```

**Tasks:**
- [ ] Create `DayRange` type definition
- [ ] Replace `currentWeek` state with `dayRange` state
- [ ] Update initial state calculation to include buffer days
- [ ] Create helper functions for day range manipulation

#### 1.2 Refactor Event Fetching Hook

**Current Hook:**
```typescript
// useCalendarEvents.ts
export const useCalendarEvents = (weekStartDate: Date) => {
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  // Fetches events for single week
};
```

**New Hook:**
```typescript
// useCalendarEvents.ts
export const useCalendarEvents = (startDate: Date, endDate: Date) => {
  // Fetches events for flexible date range
  // Supports incremental loading
};
```

**Tasks:**
- [ ] Update `useCalendarEvents` to accept `startDate` and `endDate` instead of `weekStartDate`
- [ ] Update query key factory to use date range
- [ ] Ensure API request supports flexible date ranges
- [ ] Add support for incremental event loading (optional optimization)

#### 1.3 Update Event Layout Calculation

**Current Implementation:**
```typescript
// useEventLayouts.ts
export const useEventLayouts = (
  weekStartDate: Date,
  events: CalendarEventResponseDto[],
): Map<string, EventLayoutMap> => {
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStartDate,
    end: weekEndDate,
  });
  // ...
};
```

**New Implementation:**
```typescript
// useEventLayouts.ts
export const useEventLayouts = (
  startDate: Date,
  endDate: Date,
  events: CalendarEventResponseDto[],
): Map<string, EventLayoutMap> => {
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  // ...
};
```

**Tasks:**
- [ ] Update `useEventLayouts` to accept date range
- [ ] Calculate layouts for all days in range
- [ ] Ensure performance with large date ranges (memoization)

### Phase 2: Infinite Scrolling Implementation

#### 2.1 Implement Scroll Detection and Day Loading

**New Hook: `useInfiniteScrollDays`**
```typescript
// hooks/useInfiniteScrollDays.ts
export const useInfiniteScrollDays = (
  containerRef: RefObject<HTMLDivElement>,
  initialStartDate: Date,
  initialEndDate: Date,
  onLoadMoreDays: (direction: 'left' | 'right') => void,
) => {
  // Detects scroll position
  // Triggers loading more days when near edges
  // Returns current visible date range
};
```

**Tasks:**
- [ ] Create `useInfiniteScrollDays` hook
- [ ] Implement scroll position detection
- [ ] Add threshold-based loading triggers (e.g., load when within 5 days of edge)
- [ ] Debounce scroll events for performance
- [ ] Handle scroll direction detection

#### 2.2 Dynamic Day Generation

**Current Implementation:**
```typescript
// CalendarView.tsx
const days = eachDayOfInterval({
  start: weekStartDate,
  end: weekEndDate,
});
```

**New Implementation:**
```typescript
// CalendarView.tsx
const [visibleDays, setVisibleDays] = useState<Date[]>(() => {
  // Initial visible days
});

useEffect(() => {
  // Update visible days based on scroll position and dayRange
  const days = eachDayOfInterval({
    start: dayRange.startDate,
    end: dayRange.endDate,
  });
  setVisibleDays(days);
}, [dayRange]);
```

**Tasks:**
- [ ] Replace static day array with dynamic state
- [ ] Generate days based on `dayRange`
- [ ] Optimize rendering for large day arrays (consider virtualization)
- [ ] Ensure smooth scrolling experience

#### 2.3 Update CalendarPage State Management

**Current Implementation:**
```typescript
// CalendarPage.tsx
const handlePreviousWeek = () => {
  setCurrentWeek((prev) => addWeeks(prev, -1));
};

const handleNextWeek = () => {
  setCurrentWeek((prev) => addWeeks(prev, 1));
};
```

**New Implementation:**
```typescript
// CalendarPage.tsx
const handleLoadMoreDays = (direction: 'left' | 'right') => {
  setDayRange((prev) => {
    if (direction === 'left') {
      const newStartDate = subDays(prev.startDate, 30);
      return {
        ...prev,
        startDate: newStartDate,
        visibleStartDate: newStartDate,
      };
    } else {
      const newEndDate = addDays(prev.endDate, 30);
      return {
        ...prev,
        endDate: newEndDate,
        visibleEndDate: newEndDate,
      };
    }
  });
};
```

**Tasks:**
- [ ] Replace week navigation handlers with day range expansion
- [ ] Implement `handleLoadMoreDays` function
- [ ] Update event fetching to use new date range
- [ ] Remove or repurpose Previous/Next week buttons (optional)

### Phase 3: Current Day Focus

#### 3.1 Auto-scroll to Current Day on Mount

**Implementation:**
```typescript
// CalendarView.tsx
const calendarGridRef = useRef<HTMLDivElement>(null);
const todayColumnRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Scroll to current day on initial mount
  if (todayColumnRef.current && calendarGridRef.current) {
    const todayElement = todayColumnRef.current;
    const container = calendarGridRef.current;
    
    const scrollLeft = todayElement.offsetLeft - container.offsetLeft;
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }
}, []); // Only on mount
```

**Tasks:**
- [ ] Add ref to current day's DayColumn
- [ ] Implement scroll-to-current-day logic
- [ ] Ensure it only runs on initial mount
- [ ] Add smooth scroll animation
- [ ] Handle edge cases (current day not in initial range)

#### 3.2 Update "Today" Button Behavior

**Current Implementation:**
```typescript
// CalendarPage.tsx
const handleToday = () => {
  setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
};
```

**New Implementation:**
```typescript
// CalendarPage.tsx
const handleToday = () => {
  const today = new Date();
  // Ensure today is in the day range
  setDayRange((prev) => {
    let newRange = { ...prev };
    
    if (today < prev.startDate) {
      newRange.startDate = subDays(today, 30);
      newRange.visibleStartDate = newRange.startDate;
    } else if (today > prev.endDate) {
      newRange.endDate = addDays(today, 30);
      newRange.visibleEndDate = newRange.endDate;
    }
    
    return newRange;
  });
  
  // Scroll to today (handled in CalendarView)
};
```

**Tasks:**
- [ ] Update `handleToday` to work with day range
- [ ] Ensure today is always in the loaded range
- [ ] Trigger scroll to today in CalendarView
- [ ] Add visual feedback when scrolling to today

#### 3.3 Visual Highlighting of Current Day

**Current Implementation:**
```typescript
// DayColumn.tsx
<Paper
  className={`${styles.dayHeader} ${
    isToday(day) ? styles.today : ''
  }`}
>
```

**Enhancement:**
- Current implementation already highlights today
- Ensure it works correctly with infinite scrolling
- Consider adding scroll indicator or animation when auto-scrolling to today

**Tasks:**
- [ ] Verify today highlighting works with dynamic days
- [ ] Add scroll indicator (optional)
- [ ] Test visual feedback

### Phase 4: Performance Optimization

#### 4.1 Virtual Scrolling (Optional but Recommended)

**Consideration:**
For large date ranges (100+ days), consider implementing virtual scrolling to only render visible day columns.

**Implementation Options:**
1. **React Window / React Virtual**: Use a library for virtual scrolling
2. **Custom Virtual Scrolling**: Implement custom solution
3. **Lazy Loading**: Load days on-demand as user scrolls

**Tasks:**
- [ ] Evaluate performance with 100+ days
- [ ] Implement virtual scrolling if needed
- [ ] Test scroll performance
- [ ] Optimize event layout calculations

#### 4.2 Event Loading Optimization

**Current Implementation:**
- Loads all events for the entire date range at once

**Optimization:**
- Implement incremental loading
- Load events for visible days first
- Load additional events as user scrolls

**Tasks:**
- [ ] Implement incremental event loading
- [ ] Add loading states for newly loaded days
- [ ] Cache events efficiently
- [ ] Handle event updates across date ranges

#### 4.3 Memoization and Re-render Optimization

**Tasks:**
- [ ] Memoize day column components
- [ ] Optimize event layout calculations
- [ ] Use React.memo for DayColumn
- [ ] Debounce scroll handlers
- [ ] Optimize drag-and-drop handlers

### Phase 5: UI/UX Enhancements

#### 5.1 Update Header Display

**Current Implementation:**
```typescript
// CalendarView.tsx
<Typography variant="h5" className={styles.weekTitle}>
  {format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d, yyyy')}
</Typography>
```

**New Implementation:**
```typescript
// CalendarView.tsx
const visibleStartDate = // Calculate from scroll position
const visibleEndDate = // Calculate from scroll position

<Typography variant="h5" className={styles.weekTitle}>
  {format(visibleStartDate, 'MMM d')} - {format(visibleEndDate, 'MMM d, yyyy')}
</Typography>
```

**Tasks:**
- [ ] Update header to show visible date range
- [ ] Calculate visible range from scroll position
- [ ] Update header dynamically as user scrolls
- [ ] Maintain responsive design

#### 5.2 Navigation Button Updates

**Options:**
1. **Remove Previous/Next Week buttons** (replaced by scrolling)
2. **Keep buttons but change behavior** (jump by weeks)
3. **Add "Jump to Today" button** (if not already prominent)

**Tasks:**
- [ ] Decide on navigation button strategy
- [ ] Update button behavior or remove
- [ ] Ensure "Today" button is prominent
- [ ] Test navigation on mobile

#### 5.3 Scroll Indicators

**Optional Enhancement:**
- Add visual indicators showing more days available to scroll
- Add scroll position indicator
- Show current day marker in scroll position

**Tasks:**
- [ ] Design scroll indicators
- [ ] Implement if desired
- [ ] Test on mobile and desktop

### Phase 6: Drag and Drop Compatibility

#### 6.1 Ensure Drag-and-Drop Works Across All Days

**Current Implementation:**
- Drag-and-drop works within the week
- Uses `@dnd-kit/core` for drag handling

**Verification:**
- Ensure droppable areas work for all dynamically loaded days
- Test dragging events across large date ranges
- Verify drop position calculation works correctly

**Tasks:**
- [ ] Test drag-and-drop with infinite scrolling
- [ ] Verify drop targets are correctly registered
- [ ] Test dragging across many days
- [ ] Ensure drop position calculation is accurate

#### 6.2 Update Drop Position Calculation

**Current Implementation:**
```typescript
// event-drag.utils.ts
const calculateDropPosition = (
  dropTopY: number,
  dayElement: HTMLElement,
  dropDay: Date,
) => {
  // Calculates drop position within day
};
```

**Verification:**
- Ensure it works with dynamically positioned day columns
- Test with different scroll positions
- Verify accuracy across all days

**Tasks:**
- [ ] Test drop position calculation
- [ ] Fix any issues with dynamic day positions
- [ ] Add edge case handling

### Phase 7: Testing and Edge Cases

#### 7.1 Test Scenarios

**Test Cases:**
1. **Initial Load**
   - [ ] Calendar loads with current day visible
   - [ ] Current day is scrolled into view
   - [ ] Events load correctly

2. **Scrolling**
   - [ ] Smooth horizontal scrolling
   - [ ] Days load as user scrolls
   - [ ] Events load for new days
   - [ ] Performance remains good with many days

3. **Navigation**
   - [ ] "Today" button scrolls to current day
   - [ ] Current day highlighting works
   - [ ] Header updates correctly

4. **Drag and Drop**
   - [ ] Can drag events across all days
   - [ ] Drop position is accurate
   - [ ] Events update correctly after drop

5. **Edge Cases**
   - [ ] Very large date ranges (100+ days)
   - [ ] Rapid scrolling
   - [ ] Scrolling to past/future dates
   - [ ] Events spanning multiple days
   - [ ] Mobile touch scrolling

#### 7.2 Performance Testing

**Metrics to Monitor:**
- Initial render time
- Scroll performance (FPS)
- Memory usage with many days
- Event loading time
- Re-render frequency

**Tasks:**
- [ ] Profile initial render
- [ ] Test scroll performance
- [ ] Monitor memory usage
- [ ] Optimize bottlenecks

### Phase 8: Mobile Considerations

#### 8.1 Touch Scrolling

**Tasks:**
- [ ] Ensure smooth touch scrolling on mobile
- [ ] Test scroll momentum
- [ ] Verify scroll detection works on touch devices
- [ ] Test drag-and-drop on mobile

#### 8.2 Responsive Design

**Tasks:**
- [ ] Verify day column widths on mobile
- [ ] Test header layout
- [ ] Ensure navigation buttons work
- [ ] Test current day focus on mobile

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Data structure refactoring
2. Update event fetching hook
3. Update event layout calculation

### Phase 2: Core Functionality (Week 1-2)
1. Implement infinite scrolling
2. Dynamic day generation
3. Update CalendarPage state management

### Phase 3: Current Day Focus (Week 2)
1. Auto-scroll to current day
2. Update "Today" button
3. Visual highlighting

### Phase 4: Performance (Week 2-3)
1. Performance optimization
2. Virtual scrolling (if needed)
3. Event loading optimization

### Phase 5: Polish (Week 3)
1. UI/UX enhancements
2. Navigation updates
3. Scroll indicators

### Phase 6: Compatibility (Week 3)
1. Drag-and-drop testing
2. Drop position fixes

### Phase 7: Testing (Week 4)
1. Comprehensive testing
2. Performance testing
3. Edge case handling

### Phase 8: Mobile (Week 4)
1. Mobile testing
2. Responsive design verification

## Files to Modify

### Core Files
- `frontend/src/pages/CalendarPage/CalendarPage.tsx`
- `frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.tsx`
- `frontend/src/pages/CalendarPage/components/CalendarView/DayColumn/DayColumn.tsx`
- `frontend/src/pages/CalendarPage/hooks/useCalendarEvents.ts`
- `frontend/src/pages/CalendarPage/hooks/useEventLayouts.ts`

### New Files
- `frontend/src/pages/CalendarPage/hooks/useInfiniteScrollDays.ts`
- `frontend/src/pages/CalendarPage/hooks/useScrollToToday.ts` (optional)

### CSS Updates
- `frontend/src/pages/CalendarPage/components/CalendarView/CalendarView.module.css`
- `frontend/src/pages/CalendarPage/components/CalendarView/DayColumn/DayColumn.module.css`

## Dependencies

### Existing Dependencies
- `date-fns`: Date manipulation
- `@dnd-kit/core`: Drag and drop
- `@mui/material`: UI components
- `@tanstack/react-query`: Data fetching

### Potential New Dependencies
- `react-window` or `react-virtual`: Virtual scrolling (optional)
- `lodash.debounce` or similar: Scroll debouncing (if not using custom)

## Success Criteria

1. ✅ Users can scroll horizontally through days infinitely
2. ✅ Current day is automatically focused on initial load
3. ✅ Events load correctly for all visible days
4. ✅ Drag-and-drop works across all days
5. ✅ Performance remains smooth with 100+ days
6. ✅ "Today" button scrolls to current day
7. ✅ Mobile experience is smooth and responsive
8. ✅ No regressions in existing functionality

## Risks and Mitigations

### Risk 1: Performance Degradation
**Mitigation:** Implement virtual scrolling if needed, optimize re-renders, use memoization

### Risk 2: Complex State Management
**Mitigation:** Use clear state structure, add comprehensive tests, document state transitions

### Risk 3: Drag-and-Drop Issues
**Mitigation:** Thorough testing, maintain existing drag-and-drop logic, add edge case handling

### Risk 4: Event Loading Complexity
**Mitigation:** Incremental loading, proper caching, clear loading states

## Notes

- Consider keeping week-based navigation as an alternative view mode
- Virtual scrolling may not be necessary if performance is acceptable
- Current day focus should be smooth and non-intrusive
- Maintain backward compatibility with existing event creation workflows

