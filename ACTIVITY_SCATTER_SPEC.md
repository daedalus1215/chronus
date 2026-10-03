# Spec — Activity Scatter Plot

**Branch:** `activity-scatter` · **Page:** ActivityPage · **Status:** implemented

## Goal

Give the ActivityPage a view of *when* work happens over a selectable time
period: which days had activity, what time of day it happened, how long each
session ran, and which note it was on. Complements the existing cards:
Weekly Trend (totals per day), Radar (per-note share for a day), DataGrid
(raw rows for a day).

## Data — no backend changes

`GET /time-tracks?from=&to=` already exists (`getTimeTracksByDateRange`, used
by TimeEntryPage). Returns raw tracks:

```ts
TimeTrackWithNoteResponse = {
  id, noteId, noteName, date: 'YYYY-MM-DD', startTime: 'HH:mm:ss',
  durationMinutes, note?, createdAt, updatedAt
}
```

Everything the plot needs is in the response.

## Design

One point per time track.

| Channel | Encoding |
|---|---|
| X axis | Time of day (`startTime` → minutes since midnight, 0–1440, linear) |
| Y axis | Date in the selected range (band scale — one row per day, oldest → newest top → bottom) |
| Marker size | `durationMinutes` via the z-axis (bubble = session length) |
| Color | Note (`noteName`) — one series per note, legend identifies them |
| Tooltip | Custom: note name, date, start time, duration |

Why this shape: the interesting question a per-day bar chart can't answer is
*when in the day* work clusters. A day × time-of-day scatter answers that in
one glance and doubles as a "work rhythm" view (early vs. late sessions,
evening creep, etc.).

## UI

- **Placement:** new full-width card in `chartSection`, directly below
  WeeklyTrendChart (above the DataGrid).
- **Range control:** reuse TimeEntryPage's `DateRangePicker` (presets
  Today/3d/5d/7d + custom From/To fields). It's self-contained (props-driven,
  no page state), so move it to `src/components/DateRangePicker/` as a shared
  component and update TimeEntryPage's import.
- **Default range:** last 7 days.
- **Loading / empty:** follow WeeklyTrendChart's pattern (Paper container,
  "Loading…" / "No activity in the selected range").
- **Styling:** house pattern — `Paper` + `.module.css`
  (container/header/chartContainer), `#6366f1` accent family, fixed height
  (~360px), same margins as WeeklyTrendChart.
- **Rendering:** hand-rolled SVG (no new dependencies). `@mui/x-charts`
  v8.9's ScatterChart cannot vary marker size per point — its z-axis
  drives color mapping, not size, and the renderer slot is limited to
  `svg-single`/`svg-batch` — so the agreed encoding (size = duration
  *and* color = note) is drawn directly. Axes, day gridlines, legend,
  and the hover tooltip (in-SVG foreignObject) are all local.

## Implementation plan (commit split)

1. **Move DateRangePicker to shared** — `src/components/DateRangePicker/`
   (tsx + module css), update TimeEntryPage import. Behavior unchanged.
2. **`ActivityScatterChart` component** —
   `ActivityPage/components/ActivityScatterChart/` (+ module css):
   props `{ tracks, from, to, loading }`; memoizes day-index and per-note
   totals/colors, renders hand-rolled SVG (axes, day gridlines, points,
   legend, hover tooltip), handles loading/empty states.
3. **ActivityPage wiring** — range state (default 7d), fetch via
   `getTimeTracksByDateRange` on range change, render the range picker +
   new card in the chart section.

## Verification

- `npm run build` green (tsc + vite).
- Browser (headless Chromium, real JWT): seed tracks across several days/times
  via the API; confirm points land at the right day/time positions, bubble
  size scales with duration, legend shows note colors, tooltip content,
  empty state, loading state, and that TimeEntryPage's DateRangePicker still
  works after the move.

## Decisions (locked)

1. **Encoding:** per-track, day × time-of-day (X = time of day, Y = date row,
   size = duration, color = note).
2. **Range presets:** TimeEntryPage's set (Today/3d/5d/7d) + custom From/To,
   default 7d — reused as-is after the move to shared.
3. **Color:** per-note with legend (most-active-first palette assignment).
