# check-items module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Checklist items within notes -- create, toggle, reorder, update, delete.

## Location

`backend/src/check-items/`

## Actions

Folder base: `apps/actions/`

- CreateCheckItemAction (POST /check-items)
- GetCheckItemAction (GET /check-items/:id)
- GetCheckItemsByNoteAction (GET /check-items/note/:noteId)
- ToggleCheckItemAction (PATCH /check-items/:id/toggle)
- UpdateCheckItemAction (PATCH /check-items/:id)
- UpdateCheckItemStatusAction (PATCH /check-items/:id/status)
- DeleteCheckItemAction (DELETE /check-items/:id)
- ReorderCheckItemsAction (PATCH /check-items/reorder)

## Services

- `CheckItemService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `CreateCheckItemTransactionScript`
- `GetCheckItemTransactionScript`
- `GetCheckItemsByNoteTransactionScript`
- `ToggleCheckItemTransactionScript`
- `UpdateCheckItemTransactionScript`
- `UpdateCheckItemStatusTransactionScript`
- `DeleteCheckItemTransactionScript`
- `ReorderCheckItemsTransactionScript`

- `orderCheckItemsForDisplay` (`domain/transaction-scripts/order-check-items-for-display.ts`) -- pure display-order
  helper (not a transaction script). Unchecked items keep manual `sortOrder` (DESC); checked items sink below
  all unchecked ones, newest `completedAt` first. Applied by the get-by-note, create, and reorder scripts so every
  read path returns display order, and mirrored by the frontend (`NotePage/components/CheckListView/orderCheckItems.ts`)
  for optimistic cache updates.

## Aggregators

- CheckItemsAggregator (exported -- consumed by note-transfer via CHECK_ITEM_WRITER_PORT)

## Entities

- `CheckItem` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `CheckItemsRepository`
- `CheckItemsHydrator`

## Listeners (EventEmitter2)

- `DeleteCheckItemsByNoteListener (via EventEmitter2)`

## Exports

- `CheckItemsAggregator`
- `CHECK_ITEM_WRITER_PORT`

## Folder structure

```
check-items/
  apps/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  apps/dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
    entities/
  infra/repositories/
  check-items.module.ts
```
