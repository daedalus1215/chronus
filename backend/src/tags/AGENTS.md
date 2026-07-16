# tags module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Tag management -- CRUD tags, associate/disassociate tags with notes.

## Location

`backend/src/tags/`

## Actions

Folder base: `app/actions/`

- CreateTagAction (POST /tags)
- GetTagByIdAction (GET /tags/:id)
- GetTagsByUserIdAction (GET /tags)
- GetTagsByNoteIdAction (GET /tags/note/:noteId)
- UpdateTagAction (PATCH /tags/:id)
- DeleteTagAction (DELETE /tags/:id)
- AddTagToNoteAction (POST /tags/note)
- RemoveTagFromNoteAction (DELETE /tags/note)

## Services

- `TagService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `CreateTagTransactionScript`
- `GetTagsByNoteIdTransactionScript`
- `GetTagsByNoteIdsTransactionScript`
- `GetTagsByUserIdTransactionScript`
- `UpdateTagTransactionScript`
- `DeleteTagTransactionScript`
- `AddTagToNoteTransactionScript`
- `RemoveTagFromNoteTransactionScript`

## Aggregators

- TagAggregator (exported -- consumed by time-tracks, note-transfer via TAG_ATTACH_PORT)

## Projections

- TagsByUserIdProjection (get-tags-by-user-id.projection.ts)

## Entities

- `Tag (+ shared-kernel join entity TagNote)` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `TagRepository`
- `TagNoteRepository`

## Listeners (EventEmitter2)

- `DeleteNoteTagAssociationsListener (via EventEmitter2)`

## Exports

- `TagAggregator`
- `TAG_ATTACH_PORT`

## Folder structure

```
tags/
  app/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  app/dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
    entities/
  infra/repositories/
  tags.module.ts
```
