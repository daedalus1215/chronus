name: checklist-toggle-broken
status: completed
priority: high

## Description

Updating (editing) a checklist item via the sidebar or kanban board fails with a 404. The item's name/description cannot be changed.

## Reproduction

1. Open any memo with check items
2. In the right sidebar, click on a check item to edit it
3. Enter a new name and save
4. The request returns 404 and the item is not updated
5. Same result on the kanban board via the card details dialog

## Expected

The check item name/description should be updated and the UI should reflect the change.

## Actual

The API call `PATCH /check-items/items/:id/notes/:noteId` returns 404. The route was never registered.

## Root Cause

Two issues:

1. **Primary — missing controller registration.** `UpdateCheckItemAction` defines the route `PATCH /check-items/items/:id/notes/:noteId`, but it was never added to the `controllers` array in `check-items.module.ts`. The action file and its import existed, but the controller was unregistered, so NestJS had no handler for the route — it returned 404.

2. **Secondary — toggle mutation cache type mismatch.** The `toggleItemMutation.onSuccess` handler called `.map()` directly on a `Note` object instead of `Note.checkItems`, causing a `TypeError` if the toggle API succeeded but the cache update failed silently.

## Fix

1. Added `UpdateCheckItemAction` import and controller registration in `check-items.module.ts`
2. Fixed `toggleItemMutation.onSuccess` to correctly access `oldData.checkItems.map(...)`

## Resolution

Commit: fd91283
- `backend/src/check-items/check-items.module.ts`: added `UpdateCheckItemAction` import and controller
- `frontend/src/pages/NotePage/components/CheckListView/hooks/useCheckItems.ts`: fixed toggle cache handler type
