# time-tracks module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Time tracking for notes -- create, retrieve, aggregate, and report time entries.

## Location

`backend/src/time-tracks/`

## Actions

Folder base: `apps/actions/`

- CreateTimeTrackAction (POST /time-tracks)
- FetchTimeTracksByNoteIdAction (GET /time-tracks/note/:noteId)
- FetchTimeTracksTotalByNoteIdAction (GET /time-tracks/total/:noteId)
- FetchDailyTimeTracksAction (GET /time-tracks/daily-aggregation)
- FetchTimeTracksByDateRangeAction (GET /time-tracks/date-range)
- FetchWeeklyMostActiveNoteAction (GET /time-tracks/weekly-most-active-note)
- FetchWeeklyTrendAction (GET /time-tracks/weekly-trend)
- FetchStreakAction (GET /time-tracks/streak)
- FetchNotesByYearAction (GET /time-tracks/notes-by-year)
- DeleteTimeTrackAction (DELETE /time-tracks/:id)
- UpdateTimeTrackNoteAction (PATCH /time-tracks/:id/note)

## Services

- `TimeTrackService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `CreateTimeTrackTransactionScript`
- `GetNoteTimeTracksTransactionScript`
- `GetTimeTracksTotalByNoteIdTransactionScript`
- `GetDailyTimeTracksAggregationTransactionScript`
- `DeleteTimeTrackTransactionScript`
- `UpdateTimeTrackNoteTransactionScript`
- `GetWeeklyMostActiveNoteTransactionScript`
- `GetWeeklyTrendTransactionScript`
- `GetStreakTransactionScript`
- `GetNotesByYearTransactionScript`
- `GetTimeTracksByDateRangeTransactionScript`

## Converters

- `UpdateTimeTrackPayloadConverter` (colocated with consuming TS)

## Aggregators

- TimeTracksAggregator (exported -- consumed by note-transfer via TIME_TRACK_WRITER_PORT)

## Responders

- TimeTrackWithNoteNamesResponder (`apps/actions/.../`)

## Entities

- `TimeTrack` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `TimeTrackRepository`

## Module imports (cross-domain dependencies)

- `NotesModule`
- `TagsModule`

## Exports

- `TimeTracksAggregator`
- `TIME_TRACK_WRITER_PORT`

## Folder structure

```
time-tracks/
  apps/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
      {action-name}.responder.ts   # optional
  apps/dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
      {ts-name}-TS/
        {ts-name}.transaction.script.ts
        {purpose}.converter.ts     # colocated
    entities/
  infra/repositories/
  time-tracks.module.ts
```
