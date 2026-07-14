# Quick Time Log — Rapid Time Track Entry Page

## 1. Context

Chronus is a personal knowledge management app (NestJS backend + React/Vite/MUI frontend) that tracks time spent on memos. Time tracks are stored as individual records (`TimeTrack` entity: `id`, `userId`, `noteId`, `date`, `startTime`, `durationMinutes`, `note`).

The existing **ActivityPage** shows aggregated time tracks per note for a single day via `DailyTimeTracksDataGrid` — a read-only MUI DataGrid that collapses all tracks for a note into one row. Time track creation currently happens via `TimeTrackingForm` — a Dialog modal on the HomePage that creates one track at a time, per-note. There is no surface for viewing or entering multiple individual time tracks across a date range.

## 2. Goal

Add a new page (`/time-entry`) that displays individual time tracks across a configurable date range in a DataGrid, sorted by start datetime descending, with an inline empty row at the top for rapid entry. Users can search notes as they type, create new memos on the fly, and edit/delete existing tracks inline.

## 3. Current State

### Backend
- `TimeTrack` entity: `id`, `createdAt`, `updatedAt`, `userId`, `noteId`, `date`, `startTime`, `durationMinutes`, `note?`
- `POST /time-tracks` — creates a single time track (`CreateTimeTrackDto`: `date`, `startTime`, `durationMinutes`, `noteId`, `note?`)
- `DELETE /time-tracks/:id` — deletes a time track
- `PATCH /time-tracks/:id` — updates the note text on a time track
- `GET /time-tracks/daily?date=` — returns aggregated totals per note for one date (`TimeTrackAggregationResponse[]`)
- `GET /time-tracks/note/:noteId` — returns tracks for a single note
- `GET /notes/search?query=` — fuzzy search across notes, memos, checklists (min 2 chars)
- `POST /notes` — creates a new note/memo

**Gap:** No endpoint returns raw individual time tracks across all notes for a date range. The frontend needs this for the grid.

### Frontend
- `DailyTimeTracksDataGrid` — read-only MUI DataGrid showing aggregated daily totals
- `TimeTrackingForm` — Dialog-based single-track creation form
- `createTimeTrack` request: `POST /time-tracks` with `{ date, startTime, durationMinutes, noteId, note? }`
- `deleteTimeTrack` request: `DELETE /time-tracks/:id`
- `getNoteTimeTracks` request: `GET /time-tracks/note/:noteId`
- Route constants in `constants/routes.ts`
- Note search exists but is not exposed as a reusable autocomplete component for this use case

## 4. Proposed Changes

### 4.1 Backend — New Endpoint

**`GET /time-tracks/date-range`** — returns raw individual time tracks within a date range.

- **Query params:** `from` (YYYY-MM-DD, required), `to` (YYYY-MM-DD, required)
- **Response:** `TimeTrackWithNoteResponse[]` sorted by `date DESC, startTime DESC`

```typescript
// Response DTO
export class TimeTrackWithNoteResponse {
  id: number;
  noteId: number;
  noteName: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

**ADR Architecture:**
- New action: `GetTimeTracksByDateRangeAction` under `apps/actions/get-time-tracks-by-date-range-action/`
- New command: `GetTimeTracksByDateRangeCommand` (`from`, `to`, `userId`)
- New transaction script: `GetTimeTracksByDateRangeTransactionScript`
- New request DTO: `GetTimeTracksByDateRangeDto` (query params)
- New response DTO: `TimeTrackWithNoteResponse` (under `apps/dtos/responses/`)
- New swagger file for API documentation
- The transaction script queries `TimeTrack` entities filtered by `userId`, `date >= from`, `date <= to`, then joins note names via `NoteAggregator.getNoteNamesByIds()`.

**`PATCH /time-tracks/:id`** — extend to support updating `date`, `startTime`, `durationMinutes`, and `noteId` (currently only updates the `note` text field).

- Update `UpdateTimeTrackNoteDto` to an `UpdateTimeTrackDto` that accepts all mutable fields as optional.
- Or create a separate `PATCH /time-tracks/:id` handler that accepts a broader DTO.
- The existing `update-time-track-note` action only patches the `note` text. We need a general update for inline editing.

### 4.2 Backend — Memo Auto-Creation

No new endpoint needed. The existing `POST /notes` creates a memo. The frontend will call this when the user clicks "No results — Create 'X' as new memo" in the autocomplete dropdown.

### 4.3 Frontend — New Page

**Route:** `/time-entry` added to `ROUTES` in `constants/routes.ts`.

**Navigation:** Sidebar link labeled "Quick Log" (or similar) alongside Activity, Memos, etc.

**Page structure:**

```
┌─────────────────────────────────────────────────────┐
│  Quick Log                                          │
│                                                     │
│  [Date Range Controls]                              │
│  [Today] [3d] [5d] [7d]  [From: __] [To: __]       │
│                                                     │
│  ┌── Inline Add Row (always visible at top) ───────┐│
│  │ [Note search↓] [Date] [Start] [Duration] [+]/[x]││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌── DataGrid ────────────────────────────────────┐│
│  │ Note   │ Date     │ Start  │ Duration │ Actions││
│  │─────── │───────── │─────── │───────── │────────││
│  │ Design │ 2025-07- │ 14:30  │ 90 min    │ ✏️ 🗑️  ││
│  │ Review │ 2025-07- │ 10:00  │ 45 min    │ ✏️ 🗑️  ││
│  │ ...    │ ...      │ ...    │ ...       │ ...    ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 4.4 Frontend — Inline Add Row

The add row sits above the DataGrid and contains:

| Field | Component | Behavior |
|-------|-----------|----------|
| Note | `Autocomplete` (MUI) with async search | Debounced search against `GET /notes/search?query=` (300ms). Shows "No results" row when query >= 2 chars and no matches. Clicking "No results" calls `POST /notes` to create a memo, then selects the newly created note. |
| Date | `TextField type="date"` | Defaults to today. |
| Start time | `TextField type="time"` | Defaults to current time (HH:MM format, e.g., "14:30"). |
| Duration | `TextField type="number"` (minutes) | Quick-select chips below: 15, 30, 45, 60, 90, 120, 150, 180 min. Also accepts custom input. |
| Actions | Add button (✓) | Submits via `POST /time-tracks`. On success, appends to local state, refreshes grid, clears the row. |

**After submit behavior:** The row clears completely — all fields reset to defaults (date=today, time=current time, duration=empty, note=empty). This is a fresh entry each time.

**Note search behavior:**
- Minimum 2 characters to trigger search (matching backend constraint).
- Debounced at 300ms.
- When query has >= 2 chars and returns 0 results, show a single selectable row: `"+ Create 'query' as new memo"`.
- Clicking the create row calls `POST /notes` with `{ name: query, type: 'memo' }`. On success, the autocomplete selects the new note and the user can proceed to set duration and submit.
- If the user starts typing a different query, cancel any in-flight create request.

### 4.5 Frontend — DataGrid Columns

| Column | Field | Width | Editable | Notes |
|--------|-------|-------|----------|-------|
| Note | `noteName` | flex: 1, min 180px | No (read-only display) | Clickable link to `ROUTES.NOTE(noteId)` |
| Date | `date` | 130px | Yes (inline edit) | `type="date"` input |
| Start | `startTime` | 100px | Yes (inline edit) | `type="time"` input |
| Duration | `durationMinutes` | 110px | Yes (inline edit) | Number input, displayed as "Xh Ym" |
| Note | `note` | flex: 0.5, min 120px | Yes (inline edit) | Optional memo text |
| Actions | — | 80px | No | Edit toggle + Delete icon buttons |

**Inline editing approach:** Use MUI DataGrid's built-in row editing (`processRowUpdate`) or render custom edit cell components. On save, call:
- `PATCH /time-tracks/:id` for updates
- `DELETE /time-tracks/:id` for deletions

**Optimistic updates:** On edit/delete, immediately update local state and show a toast/snackbar. If the API call fails, revert and show an error.

### 4.6 Frontend — Date Range Controls

**Preset buttons:** Today, 3 days, 5 days, 7 days. Clicking a preset sets the from/to dates and refreshes the grid.

**Custom range:** Two date pickers (From, To) that override presets. Default: Today only (from = to = today).

**Default:** 5 days (yesterday + today + 3 future days? or last 5 days including today?). **Decision: Last 5 days including today** (today, yesterday, 3 days before).

### 4.7 Frontend — Data Fetching

- On mount: Fetch time tracks for the default date range (last 5 days).
- On date range change: Re-fetch.
- On add/edit/delete: Optimistic local update + background API call. On failure, revert.
- No pagination needed for 5 days of personal time entries. If the grid grows large (>100 rows), add client-side pagination.

### 4.8 New Files

**Backend — all live under `backend/src/time-tracks/` (the `TimeTracksModule`):**

New action + transaction script for the date-range endpoint:
- `apps/actions/get-time-tracks-by-date-range-action/get-time-tracks-by-date-range.action.ts`
- `apps/actions/get-time-tracks-by-date-range-action/get-time-tracks-by-date-range.swagger.ts`
- `apps/actions/get-time-tracks-by-date-range-action/dtos/get-time-tracks-by-date-range.dto.ts`
- `apps/dtos/responses/time-track-with-note.response.dto.ts`
- `domain/transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.transaction.script.ts`
- `domain/transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.command.ts`

**Extend existing** (also inside `TimeTracksModule`):
- `apps/actions/update-time-track-note-action/update-time-track-note.action.ts` — extend `UpdateTimeTrackNoteDto` to accept `date`, `startTime`, `durationMinutes`, `noteId` as optional fields (rename to `UpdateTimeTrackDto`).
- `domain/transaction-scripts/update-time-track-note.transaction.script.ts` — update to handle partial updates of all mutable fields.

**Registration:** Register the new `GetTimeTracksByDateRangeAction` controller in `time-tracks.module.ts` (alongside the existing actions). The module already imports `TimeTrackService` and its transaction scripts; inject the new transaction script and command there.

**Note:** The memo auto-create path (`POST /notes`) lives in the existing `NotesModule` — no changes needed there; the frontend simply calls the existing endpoint.

**Frontend:**
- `frontend/src/pages/TimeEntryPage/TimeEntryPage.tsx` — main page component
- `frontend/src/pages/TimeEntryPage/components/TimeEntryDataGrid/TimeEntryDataGrid.tsx` — grid component
- `frontend/src/pages/TimeEntryPage/components/TimeEntryDataGrid/TimeEntryDataGrid.module.css`
- `frontend/src/pages/TimeEntryPage/components/QuickAddRow/QuickAddRow.tsx` — inline add row
- `frontend/src/pages/TimeEntryPage/components/QuickAddRow/QuickAddRow.module.css`
- `frontend/src/pages/TimeEntryPage/components/DateRangePicker/DateRangePicker.tsx` — date range controls
- `frontend/src/pages/TimeEntryPage/hooks/useTimeTrackDateRange.ts` — date range state + fetching
- `frontend/src/pages/TimeEntryPage/hooks/useNoteSearch.ts` — debounced note search with create
- `frontend/src/api/requests/time-tracks.requests.ts` — add `getTimeTracksByDateRange` and `updateTimeTrack` functions
- `frontend/src/api/dtos/time-tracks.dtos.ts` — add `TimeTrackWithNoteResponse` type
- `frontend/src/constants/routes.ts` — add `TIME_ENTRY: '/time-entry'`

## 5. Open Questions

1. **Date range default:** "Last 5 days including today" — is this correct, or should it be "today ± 2 days" (centered on today)?
2. **Note auto-create:** When creating a memo from the "No results" row, should it default to memo type? What about checklist type? (Recommendation: default to memo, as time tracking is most commonly associated with memos.)
3. **Grid height:** Should the grid fill remaining viewport height, or have a fixed height with scroll? (Recommendation: flex to fill remaining space after date controls and add row.)
4. **Time track "note" field:** The `TimeTrack.note` field is optional free text. Should this be shown in the grid as a separate column, or hidden by default with a detail panel/tooltip? (Current proposal: show as a column, but it can be collapsed.)

## 6. Edge Cases

- **Concurrent edits:** Two tabs open, both edit the same time track. Last write wins. Consider adding an `updatedAt` check on the backend to warn on conflicts.
- **Note deleted after time track created:** If a memo is deleted but time tracks reference it, the grid should still show the track with a "Deleted note" placeholder. The backend `getNoteNamesByIds` may return `null` for missing notes.
- **Date range spans months/years:** The date range picker should handle跨年 ranges correctly.
- **Empty state:** When no time tracks exist in the date range, show a helpful message: "No time tracks for this period. Use the row above to add one."
- **Note search returns too many results:** Limit autocomplete to 10 results. If more exist, show "X more results" or let the user refine their query.
- **Network offline:** Queue create/update/delete operations locally (reuse existing IndexedDB time track sync pattern from `services/indexedDB/timeTrackDB.ts`). Show a sync indicator.
- **Duration validation:** Backend enforces `1-1440` minutes. Frontend should validate before sending and show inline errors.
- **Start time validation:** Ensure start time is in `HH:MM` format. The HTML time input handles this, but validate on submit.
