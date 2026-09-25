# Spec — Pinned Notes

**Status:** APPROVED (decisions confirmed with user, 2026-09-24)
**Author:** daedalus1215 + omp

## Why

Users have a few notes they want always in front of them. Today the Home list is pure
`updated_at DESC` recency — important notes get pushed down by any edit. Pinning floats
them to the top.

A Pin button already existed in the (dead) `NoteActionsGrid.tsx`; the live action grid
(`NoteActionGrid/NoteActionGrid.tsx`) has none. This spec supersedes that dead file.

## Decisions (confirmed)

| Question | Decision |
|---|---|
| Scope | **Global** — pinned notes float to the top of the **Home** list, above everything, regardless of folder/type/tag filters. Explorer tree ordering is **unaffected**. |
| Order among pinned | **Most recently pinned first** (`pinned_at DESC`). |
| UI surface | **⋮ action grid only** (Home list rows + Explorer tree rows). No row icon. |
| Click-to-top | Home list click-to-top inserts under the pinned block. Clicking a pinned note is a no-op (its position is server-defined). |

## Behavior

- **Pin** a note: `pinned = true`, `pinned_at = now`. Note moves to the top of the Home
  list (or to the front of the pinned block).
- **Unpin**: `pinned = false`, `pinned_at = null`. Note stays in place client-side until
  the next server fetch reconciles position.
- **Re-pin** a previously-pinned note: `pinned_at` refreshes → it jumps to the front of
  the pinned block.
- Pinning/unpinning **must not bump `updated_at`** (recency is not a side effect of pin).
- Pin state is orthogonal to: type filters (All/Memos/Checklists), tag filter, folder
  membership, archive (archived notes are already filtered out of the list query).
- Pinned notes respect the active filter: a pinned memo only appears at the top when the
  Memo filter (or All) is active.

## Data model

`notes` table (one migration, one concern):

- `pinned boolean NOT NULL DEFAULT false`
- `pinned_at timestamptz NULL`

## API

`PATCH /notes/:id/pin` — body `{ "pinned": boolean }` (class-validator, `@IsBoolean`).
Idempotent toggle. Returns the `Note` entity (mirrors `archive-note`). Auth via
`@ProtectedAction`; ownership check in the transaction script (`NotFound` otherwise).

## Backend changes

- `Note` entity: `pinned`, `pinnedAt`.
- `NoteMemoTagRepository`:
  - `updatePinned(noteId, userId, pinned)` — targeted UPDATE of `pinned`/`pinned_at`
    only; `updated_at` untouched (asserted by integration spec).
  - `getNoteNamesByUserId`: `ORDER BY pinned DESC, (pinned ? pinned_at : updated_at) DESC, id DESC`.
  - `getNoteNamesForExplorer`: adds `pinned` to the select (state display only — no
    ordering change).
- `NoteNameRow` projection + response: gains `pinned: boolean`.
- `pin-note-TS` → `NoteService.pinNote` → `pin-note` action (`PATCH /notes/:id/pin`,
  request DTO colocated with the action, swagger file).
- Tests: unit spec for the TS (pin/unpin/404/ownership); integration spec for repo
  (ordering, `updated_at` immutability).

## Frontend changes

- `NoteNameItem` / `ExplorerNoteItem` gain `pinned: boolean`.
- `notes.requests.ts`: `pinNote(noteId, pinned)`.
- `usePinNote` hook (HomePage/hooks) — mutation, error surfaced via existing snackbar
  pattern.
- `NoteActionGrid`: new `onPin` + `isPinned` props; `PushPin`/`PushPinOutlined` icon,
  label "Pin"/"Unpin".
- `useNotes`:
  - `setPinned(noteId, pinned)` — optimistic local reorder (pin → index 0; unpin →
    flag flip, stay in place).
  - `moveNoteToTop`: no-op for pinned notes; unpinned notes insert after the last
    pinned note.
- `NoteItem` + `CustomTagTreeItem` wire `onPin`/`isPinned` through.
- **Delete** dead `NoteItem/NoteActionsGrid.tsx` (unused; its Pin button is the
  "existing" one being replaced).

## Out of scope

- Explorer tree reordering by pin.
- Manual reordering within the pinned block (drag).
- Search results ordering.
- "Star" (the dead grid's second unused button) — separate feature.

## Verification

- Backend: `npm test` + `npm run test:integration` (docker Postgres 5433).
- Frontend: `npm run build` (tsc) + lint.
- Dev deploy: backend `npm run dev` (runs migrations) + frontend `npm run dev`;
  pin/unpin from both surfaces; verify top-of-list order, re-pin ordering,
  click-to-top behavior, and that `updated_at` is unchanged on pin.
