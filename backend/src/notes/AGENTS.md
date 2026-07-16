# notes module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Note management -- CRUD, search, archive, convert between types (checklist/memo).

## Location

`backend/src/notes/`

## Actions

Folder base: `apps/actions/`

- CreateNoteAction (POST /notes)
- GetNoteByIdAction (GET /notes/:id)
- UpdateNoteAction (PATCH /notes/:id)
- UpdateNoteTitleAction (PATCH /notes/:id/title)
- DeleteNoteAction (DELETE /notes/:id)
- ArchiveNoteAction (PATCH /notes/:id/archive)
- ConvertChecklistToMemoAction (POST /notes/:id/convert-to-memo)
- SearchNotesAction (GET /notes/search)
- GetNoteNamesByUserIdAction (GET /notes/names)
- GetNoteNamesForExplorerAction (GET /notes/explorer-names)
- MoveNoteToFolderAction (PATCH /notes/:id/move)
- ReorderNotesAction (PATCH /notes/reorder)
- UpdateNoteTimestampAction (PATCH /notes/:id/timestamp)

## Services

- `NoteService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `CreateNoteTransactionScript`
- `GetNoteByIdTransactionScript`
- `UpdateNoteTransactionScript`
- `UpdateNoteTitleTransactionScript`
- `ArchiveNoteTransactionScript`
- `ConvertChecklistToMemoTransactionScript`
- `SearchNotesTransactionScript`
- `GetNoteNamesByIdsTransactionScript`

## Converters

- `UpdateNoteParamsToEntityConverter` (colocated with consuming TS)

## Aggregators

- NoteAggregator (exported -- consumed by time-tracks, audio, folders, note-transfer)

## Responders

- GetNoteByIdResponder, SearchNotesResponder, UpdateNoteResponder (`apps/actions/.../`)

## Entities

- `Note, Memo` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `NoteMemoTagRepository`

## Listeners (EventEmitter2)

- `GetNoteDetailsListener`
- `VerifyNoteAccessListener (via EventEmitter2)`

## Module imports (cross-domain dependencies)

- `AuthModule`

## Exports

- `NoteAggregator (implied -- consumed cross-domain)`

## Folder structure

```
notes/
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
  notes.module.ts
```
