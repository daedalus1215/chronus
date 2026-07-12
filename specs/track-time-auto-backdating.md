# Spec — Auto-Backdating Start Time from Duration in Track Time Modal

**Status:** DRAFT
**Component:** `TimeTrackingForm` (shared by Explorer tree items and NotePage history view)
**File:** `frontend/src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm.tsx`
**Supporting:** `frontend/src/utils/dateUtils.ts`

## Problem

When logging past work, users open the Track Time modal and type a duration (e.g., "I worked on this for 90 minutes"). Today the start time defaults to `now` and the date defaults to today — the user has to manually calculate what time 90 minutes ago was and type it in. This is a two-step mental math problem that the form should solve automatically.

## Behavior

### Two Modes

The form operates in one of two mutually exclusive modes:

| Mode | Trigger | Effect on duration change | Effect on manual date/time edit |
|------|---------|---------------------------|---------------------------------|
| **Auto** (default) | Modal opens, or user clicks "Reset to now" | `date` + `startTime` recalculate as `anchor_now - duration_minutes` | Switches to Manual mode |
| **Manual** | User edits the Date or Start Time fields | Duration-only update; date and start time stay exactly as typed | No mode change (already Manual) |

### Anchor Time

`anchor_now` is captured **once when the modal opens**. It does not drift as the user interacts with the form. This means:

- If the user opens the modal at 14:00 and sets duration to 90, start time becomes 12:30.
- If they then change to 60 minutes, start time becomes 13:00.
- If they fiddle for 5 minutes and change to 120 minutes, start time becomes 12:00.

The anchor is stable; only the duration value changes the result.

### Auto Mode — On Modal Open

When the dialog opens (or reopens after close):

1. Capture `anchor_now = new Date()`.
2. Set `date` to `anchor_now` formatted as `YYYY-MM-DD`.
3. Set `startTime` to `anchor_now - defaultDuration` (currently 30 min) formatted as `HH:MM`.
4. Set `durationMinutes` to 30 (existing default).
5. Mode is Auto.

This replaces the current behavior where `startTime` defaults to the current time (`HH:MM` of `now`).

### Auto Mode — On Duration Change

When duration changes while in Auto mode (chip click or custom input):

1. Compute `calc = anchor_now - newDurationMinutes`.
2. Set `date` to `calc` formatted as `YYYY-MM-DD`.
3. Set `startTime` to `calc` formatted as `HH:MM`.
4. Set `durationMinutes` to the new value.
5. Mode stays Auto.

### Manual Mode — On User Date/Time Edit

When the user changes the Date or Start Time field via the native input picker or keyboard:

1. Update the edited field.
2. Switch to Manual mode.
3. An "Auto" reset chip/button becomes visible (see UI section below).

### Manual Mode — On Duration Change

When duration changes while in Manual mode:

1. Set `durationMinutes` to the new value.
2. `date` and `startTime` remain unchanged.

### Reset to Auto

In Manual mode, show a small reset control that returns the form to Auto mode:

- **UI:** A `Typography` link or small text button reading "Reset to now" placed above the Date field, only visible when in Manual mode.
- **Action:** Re-capture `anchor_now = new Date()`, recalculate date + start time from current duration, switch back to Auto mode, hide the control.

### Custom Duration Input — Debounce

The custom duration number input triggers auto-recalculation on every keystroke, debounced at **500ms**:

- On each keystroke, start/restart a 500ms timer.
- When the timer fires, recalculate date + start time from the current typed value.
- If the user closes the modal before the debounce fires, clear the timer.
- If the typed value is empty or non-numeric, do not recalculate (leave date/time as-is).

Chip clicks are **not** debounced — they fire immediately.

### Date Rollover

When `anchor_now - duration_minutes` crosses midnight, both the date and time fields update:

- Example: `anchor_now` is 00:15 on July 13. Duration 60 → `date = 2025-07-12`, `startTime = 23:15`.
- Multi-day durations (e.g., 2000 minutes ≈ 33 hours) roll back multiple days. No special UI needed; the date picker handles it.

## State Changes

### New State Variables

```typescript
const [anchorNow, setAnchorNow] = useState<Date | null>(null);
const [autoMode, setAutoMode] = useState<boolean>(true);
const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### Modified `formData` Initialization

On modal open (`isOpen` transitions `false → true`):

```typescript
// Replace:
// initialData || { date: getCurrentDateString(), startTime: getCurrentTimeString(), durationMinutes: 30, note: '' }

// With:
const now = new Date();
const backdated = new Date(now.getTime() - 30 * 60 * 1000);
{
  date: getDateString(backdated),
  startTime: getTimeString(backdated),
  durationMinutes: 30,
  note: '',
}
```

Note: Use existing `getDateString()` and `getTimeString()` from `dateUtils.ts`.

### Duration Change Handler

Extract a single `handleDurationChange` function:

```typescript
const handleDurationChange = (minutes: number) => {
  setFormData(prev => ({ ...prev, durationMinutes: minutes }));

  if (autoMode && anchorNow) {
    const calc = new Date(anchorNow.getTime() - minutes * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      date: getDateString(calc),
      startTime: getTimeString(calc),
    }));
  }
};
```

### Date/Time Change Handlers

```typescript
// Date change
onChange={e => {
  setAutoMode(false);
  setFormData({ ...formData, date: e.target.value });
}}

// Start time change
onChange={e => {
  setAutoMode(false);
  setFormData({ ...formData, startTime: e.target.value });
}}
```

### Custom Duration Input with Debounce

```typescript
onChange={e => {
  const raw = e.target.value;
  const minutes = raw === '' ? undefined : Number(raw);

  // Clear previous debounce
  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

  if (raw === '' || isNaN(minutes)) {
    setFormData({ ...formData, durationMinutes: undefined });
    return;
  }

  // Start debounce timer
  debounceTimerRef.current = setTimeout(() => {
    handleDurationChange(minutes);
  }, 500);

  // Update form immediately so the field reflects keystrokes
  setFormData({ ...formData, durationMinutes: minutes });
}}
```

Clean up the timer on unmount:

```typescript
useEffect(() => {
  return () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  };
}, []);
```

## UI Changes

### "Reset to now" Control

When `autoMode` is `false`, render a `Typography` component above the Date field:

```tsx
{!autoMode && (
  <Typography
    component="span"
    color="primary"
    sx={{ cursor: 'pointer', fontSize: '0.75rem', mb: 1, display: 'block' }}
    onClick={() => {
      const now = new Date();
      setAnchorNow(now);
      setAutoMode(true);
      const calc = new Date(now.getTime() - (formData.durationMinutes || 30) * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        date: getDateString(calc),
        startTime: getTimeString(calc),
      }));
    }}
  >
    Reset to now
  </Typography>
)}
```

This is intentionally subtle — a small clickable link, not a prominent button.

### Modal Open Trigger

The `isOpen` prop controls the dialog. Add a `useEffect` that reinitializes anchor and defaults when the modal opens:

```typescript
useEffect(() => {
  if (isOpen && !anchorNow) {
    const now = new Date();
    setAnchorNow(now);
    const backdated = new Date(now.getTime() - 30 * 60 * 1000);
    setFormData({
      date: getDateString(backdated),
      startTime: getTimeString(backdated),
      durationMinutes: 30,
      note: '',
    });
    setAutoMode(true);
  }
}, [isOpen]);
```

Reset `anchorNow` on close so reopening gets a fresh anchor:

```typescript
onClose handler should also setAnchorNow(null).
```

## Existing Code Impact

### `TimeTrackingForm.tsx`
- Add `getDateString`, `getTimeString` imports from `dateUtils.ts`.
- Add `useEffect`, `useRef` to imports.
- Add `anchorNow`, `autoMode`, `debounceTimerRef` state.
- Replace inline `onChange` handlers for date, start time, and custom duration.
- Extract `handleDurationChange` and wire it to chip clicks and debounced custom input.
- Add "Reset to now" conditional render.
- Add cleanup `useEffect`.

### `dateUtils.ts`
- No changes needed. `getDateString()` and `getTimeString()` already exist and accept a `Date` argument.

### `TimeTrackingForm.module.css`
- No changes needed.

## Where This Form Is Used

The `TimeTrackingForm` component is used in two places:

1. **Explorer tree items** — `CustomTagTreeItem.tsx` (home page note list)
2. **Note detail page** — `TimeTrackHistoryView.tsx`

Both pass `isOpen`, `onClose`, `onSubmit`, and optionally `initialData`. The auto-backdating logic is entirely internal to the form — callers don't need changes.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duration = 0 | No recalculation; leave date/time as-is |
| Duration > 1440 (>1 day) | Date rolls back multiple days; time wraps within 24h |
| Custom input: non-numeric chars | `Number('abc')` → `NaN`; skip recalculation |
| Custom input: empty string | `durationMinutes = undefined`; skip recalculation |
| Modal opened, user types in note field, then changes duration | Auto recalculation proceeds (note edits don't trigger Manual mode) |
| Modal opened, user edits date, then edits start time | Already Manual; no additional state change |
| Modal opened, user edits date to Manual, then clicks Reset | Re-captures anchor, recalculates from current duration, returns to Auto |
| `initialData` passed by caller | Use `initialData` values; set `autoMode = false` (caller-provided data is treated as Manual) |

## Testing

### Unit tests (new file: `frontend/src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm.test.tsx`)

Test with `@testing-library/react` and Jest (existing project setup):

1. **Default open:** Modal opens → start time is ~30 min before current time, date may be today or yesterday depending on time of day.
2. **Chip click (Auto mode):** Click "1h" chip → start time updates to ~60 min before anchor, date may change.
3. **Custom input (debounced):** Type "90" in custom field → after 500ms, start time updates to ~90 min before anchor.
4. **Manual override:** Change start time via input → subsequent duration chip clicks do NOT change start time.
5. **Reset to now:** After manual override, click "Reset to now" → start time recalculates from fresh anchor.
6. **Date rollover:** Mock `Date` to 00:15, set duration to 60 → date is previous day, time is 23:15.
7. **Custom input empty:** Clear custom input → no recalculation occurs.
8. **Modal reopen:** Close then reopen → fresh anchor captured, recalculation uses new `now`.

Mock `Date` via `useFakeTimers` or `jest.useFakeTimers()` for deterministic tests.

## Out of Scope

- Persistent "last used duration" memory across sessions
- Smart duration suggestions based on historical data
- End time display (the form only shows date, start time, duration)
- Backend changes (API contract unchanged)
