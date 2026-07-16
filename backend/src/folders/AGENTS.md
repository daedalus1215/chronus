# folders module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Folder tree management -- create, update, delete, reorder, bulk reparent folders for notes.

## Location

`backend/src/folders/`

## Actions

Folder base: `app/actions/`

- CreateFolderAction (POST /folders)
- GetFoldersByUserAction (GET /folders)
- UpdateFolderAction (PATCH /folders/:id)
- DeleteFolderAction (DELETE /folders/:id)
- BulkReparentAction (PATCH /folders/reparent)
- ReorderFoldersAction (PATCH /folders/reorder)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `CreateFolderTransactionScript`
- `GetFoldersByUserTransactionScript`
- `UpdateFolderTransactionScript`
- `DeleteFolderTransactionScript`
- `BulkReparentFoldersTransactionScript`
- `ReorderFoldersTransactionScript`

## Ports

- NOTE_FOLDER_PORT (exported -- consumed by notes module for move-to-folder)

## Entities

- `Folder` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `FolderRepository`

## Module imports (cross-domain dependencies)

- `NotesModule`

## Folder structure

```
folders/
  app/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  app/dtos/
    requests/
    responses/
  domain/
    services/
    transaction-scripts/
    entities/
  infra/repositories/
  folders.module.ts
```
