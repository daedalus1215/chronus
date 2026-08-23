# Spec — Slot memos into folders from the memo page

**Status:** Ready for implementation (all decisions confirmed with the user, 2026-08-22)
**Implementation repo:** this repo (`chronus-react-nestjs`)
**Author:** daedalus1215 + Hermes
**Date:** 2026-08-22

## Goal

While reading or editing a memo, slot it into a folder (or remove it from a folder)
without leaving the page. Today that requires going to Explorer, finding the memo in
the tree, and dragging it.

## Context (verified by reading the code, not assumed)

**Data model**
- A memo is a `Note` with `isMemo: true`, 1:1 with a `Memo` entity holding `description`.
- `Note.folderId: number | null` — the slot. `Folder` entities form a tree
  (`parentId`, `sortOrder`). No FK constraint on `folderId` (plain integer column).
- Deleting a folder already nullifies `folderId` on member notes via
  `NOTE_FOLDER_PORT.nullifyFolderIds()` (port defined in folders, implemented by
  `NoteFolderAdapter` in notes).

**Backend — move already exists**
- `PATCH /notes/:id/folder` — `MoveNoteToFolderAction` (notes module,
  `apps/actions/notes/move-note-to-folder-action/`). Body `{ folderId: number | null }`,
  200 → `{ id, folderId }`.
- `MoveNoteToFolderTransactionScript` loads the note scoped by `userId` (404 if not
  yours), then sets `folderId`. **It does not validate that the target folder exists or
  belongs to you.** A ghost `folderId` orphans the note: it vanishes from the Explorer
  (not in root, not in any folder).
- Guarding is via `@ProtectedAction` (applies `JwtAuthGuard`).
- The note-detail response (`GetNoteByIdResponder`) returns `id, name, checkItems,
  description, isMemo` — **no `folderId`**, so the memo page doesn't know where it lives.
- Stale doc: `notes/AGENTS.md` lists the endpoint as `PATCH /notes/:id/move`; the actual
  path is `PATCH /notes/:id/folder`.

**Frontend — picker already exists**
- `moveNoteToFolder(noteId, folderId)` in `src/api/requests/notes.requests.ts`
  (PATCHes `/notes/${noteId}/folder`).
- `MoveNoteDialog` (`src/pages/ExplorerPage/components/MoveNoteDialog/`) — fetches
  `GET /folders` on open, renders the folder tree with a "Root (no folder)" row, confirm
  button, `disabledFolderIds` / `dialogTitle` / `helperText` props. Used by Explorer
  (NotesBrowser context menu, ExplorerTree dialog, drag-and-drop).
- NotePage top rail (`TopRailActions`) is **memo-only** and has: edit-mode toggle,
  Kanban, (mobile) tags, (mobile+edit) record, (desktop) sidebar toggle. No folder
  control.
- Note detail is React Query state (`noteKeys.detail(id)` in
  `useNoteQueries.ts`). The Explorer tree is **local state**, reloaded on mount — there
  is no shared cache to invalidate after a move.
- The `Note` type in `NotePage/api/responses.ts` has no `folderId`.

**Module wiring (matters for Phase 2)**
- `FoldersModule` imports `NotesModule` (one-way). The reverse would create a cycle.
- Cross-domain writes already go through ports: folders → notes via `NOTE_FOLDER_PORT`.

## Decisions (locked — confirmed with user 2026-08-22)

- **D1 — Placement (confirmed, revised per user):** the feature lives in the **right
  sidebar** as a new **folder tab** — not a top-rail icon. The sidebar is where memo
  organization metadata already lives (tags is a tab; a folder is a sibling of tags:
  both answer "where does this memo live"). The tab shows the current folder at all
  times while the sidebar is open and hosts the change action. Mobile gets it for free:
  the mobile drawer (`MobileTagsView`) renders the same `tabs` array.
  - *Tab content:* "In folder: {name}" (or "No folder") + one "Move to folder…" button
    that opens `MoveNoteDialog` (the dialog already offers "Root (no folder)" for
    un-slotting — no separate remove button).
  - *Tab position:* after tags — `checklist, tags, folder, audio, time, history`.
  - *Trade-off accepted:* the sidebar is closed by default on desktop, so the move
    path is open-sidebar → folder-tab → move → pick → confirm (~5 steps) vs ~3 with a
    top-rail icon. That's the right call because organizing a memo (tagging, checking
    history) already means the sidebar is open, and the current location is then
    persistently visible rather than hidden behind a tooltip.
- **D2 — Show current location (confirmed):** the note-detail response gains
  `folderId`; the folder tab displays the current folder (name resolved client-side
  from `GET /folders` via a small React Query hook), and the dialog pre-selects the
  current folder with a "Currently in: {name}" helper. No cross-domain folder-name read
  in the backend.
- **D3 — Scope (confirmed):** memos only. `TopRailActions` and the right sidebar both
  render for memos only; checklists live in the Kanban world and are explicitly out of
  scope.
- **D4 — Hardening (confirmed):** Phase 2 adds folder existence + ownership validation
  to the endpoint (404 on ghost/foreign folder), closing the orphan-note hole. API
  contract unchanged.
- **D5 — No folder creation from the memo page.** Explorer owns folder CRUD.
- **D6 — Phasing (confirmed):** Phase 1 and Phase 2 ship as **separate PRs**; Phase 1
  is shippable standalone.

## Phase 1 — the feature (shippable standalone)

### Backend (small)
1. `NoteResponseDto` (`notes/apps/dtos/responses/note.response.dto.ts`): add
   `folderId: number | null`.
2. `GetNoteByIdResponder.apply()`: add `folderId: note.folderId ?? null`.
3. Update `get-note-by-id.swagger.ts` response type.
4. Fix `notes/AGENTS.md` endpoint path (`/folder`, not `/move`).

### Frontend
1. `Note` type (`NotePage/api/responses.ts`): add `folderId: number | null`.
2. **Relocate `MoveNoteDialog`** from `pages/ExplorerPage/components/` to
   `src/components/MoveNoteDialog/` (it's a generic picker; two pages now need it).
   Update Explorer's three import sites.
3. `MoveNoteDialog` extensions (additive props, existing behavior untouched):
   - `currentFolderId?: number | null` — after folders load, pre-select the matching
     folder (leave "Root" selected when null).
   - Helper text derived internally: `currentFolderId` found in the list →
     "Currently in: {name}"; non-null but not found (folder deleted) → "Current folder
     no longer exists — pick a new one"; null → no helper.
   - `error?: string | null` — render `<Alert severity="error">` above `DialogActions`
     (per the established three-layer dialog error pattern).
4. New hook `NotePage/hooks/useMoveNoteToFolder/`: `useMutation` wrapping
   `moveNoteToFolder`. `onSuccess` → `setQueryData(noteKeys.detail(id), prev =>
   ({ ...prev, folderId }))` + snackbar message; `onError` → error string state (dialog
   stays open). No other cache to invalidate (Explorer reloads on mount). Used by
   `SidebarFolderView`.
5. **New sidebar tab (desktop + mobile):**
   - `NotePage.tsx`: add `{ id: 'folder', icon: <FolderOutlined /> }` to `sidebarTabs`
     after `tags`. The existing `activeTab` validation (stored id checked against the
     tab list) handles the new id with no localStorage migration.
   - New component `NotePage/components/SidebarFolderView/` (mirrors
     `SidebarTagsView`'s structure; owns its dialog open state, confirm handler, and
     snackbar, following the pattern where each sidebar view owns its mutations).
     Content:
     - Current-state row: folder icon + "In folder: {name}", or "No folder". Name
       resolved via a new shared hook `hooks/useFolders/` (`useQuery`, queryKey
       `['folders']`, wrapping the existing `fetchFolders`; `staleTime` 5 min).
       While loading → "…"; `folderId` set but absent from the list (folder deleted) →
       "Current folder no longer exists — pick a new one."
     - One contained button "Move to folder…" → opens `MoveNoteDialog`.
   - `NotePage.tsx` (desktop): add the `activeTab === 'folder'` content branch inside
     `RightSidebar`.
   - `MobileTagsView.tsx`: import `SidebarFolderView` and add the same
     `activeTab === 'folder'` content branch — its content mapping is hardcoded per
     tab id, so the shared `sidebarTabs` entry alone won't render content there.
6. `NotePage.tsx` page-level: nothing else changes; the dialog and snackbar live inside
   `SidebarFolderView`. Snackbar uses `<SnackbarContent message={...} />` as children —
   MUI `Snackbar` has no `message` prop (known pitfall).
7. Confirm handler (in `SidebarFolderView`): `await` the mutation; success → close
   dialog + snackbar ("Moved to {folder}" / "Removed from folder"); failure → error
   surfaced in the dialog, which stays open.

### Phase 1 edge cases
- **No folders exist** — dialog shows "Root (no folder)" + "No folders yet". Fine.
- **Move to the same folder** — idempotent; no client short-circuit.
- **Remove from folder** — select "Root (no folder)" → `folderId: null`.
- **Concurrent moves** — last write wins on a single column; acceptable.
- **Folder deleted while the dialog is open** — Phase 1 window is tiny (dialog only
  lists live folders); Phase 2 turns this into a visible 404 in the dialog instead of a
  silent orphan.

## Phase 2 — hardening the endpoint (separate PR, per D6)

**Goal:** `PATCH /notes/:id/folder` rejects target folders that don't exist or belong
to a different user with 404, instead of writing a dangling `folderId`.

**Design (chosen to keep the module graph acyclic — no `forwardRef`):**
1. Extend `NoteFolderPort` (folders domain) with
   `moveNoteToFolder(noteId: number, userId: number, folderId: number | null):
   Promise<number>` — implemented in the notes module's `NoteFolderAdapter` using
   `NoteRepository`: note must exist and belong to `userId` (404 otherwise), set
   `folderId`, save, return `noteId`.
2. New `MoveNoteToFolderTransactionScript` in the **folders** module: if `folderId` is
   non-null, load the folder by `{ id: folderId, userId }` (404 if missing or not
   yours), then call the port. `folderId: null` skips validation.
3. Move `MoveNoteToFolderAction` + DTO into the folders module. The controller path
   stays `PATCH /notes/:id/folder` — route paths are independent of module ownership.
4. Deregister from `notes.module.ts`, register in `folders.module.ts`.

**Why not `forwardRef` + a `FolderAggregator` in notes?** It works, but it leaves a
cyclic module dependency (FoldersModule already imports NotesModule). The port approach
mirrors the existing precedent — folders already reaches into notes via
`NOTE_FOLDER_PORT`; this extends that port with the write it's actually for.

**API contract unchanged** — Phase 1 frontend is unaffected either way.

## Tests

**Phase 1 backend**
- `GetNoteByIdResponder` spec: `folderId` passthrough (set → returned, unset → null).

**Phase 2 backend**
- Folders TS spec (`__specs__/`, SUT named `target`, `createApplyMock` helpers):
  - folder not found → 404, port not called
  - folder belongs to another user → 404, port not called
  - `folderId: null` → port called with null, no folder lookup
  - valid folder → port called with `(noteId, userId, folderId)`, returns noteId
- `NoteFolderAdapter` spec: note not found / other user's note → 404; valid → saved
  with new `folderId`.
- Architecture gates: `npm run test:architecture` (depcruise) — the moved action/TS must
  not violate layering rules; run `npx depcruise --config load-depcruise-config.js src`
  before committing.

**Frontend**
- `npx tsc --noEmit` as the fast gate (full `vite build` can hang on some setups).
- Manual QA:
  1. Memo in a folder → open the right sidebar → folder tab shows "In folder: {name}".
  2. "Move to folder…" → dialog pre-selects the current folder, helper shows its name.
  3. Move to a nested folder → snackbar; tab row updates to the new folder; reopen the
     dialog → new folder pre-selected.
  4. Unslot to "Root (no folder)" → tab shows "No folder"; Explorer root shows the memo.
  5. Error path (backend down) → confirm → error Alert inside dialog, dialog stays open.
  6. Mobile viewport → open the drawer via the top-rail tags icon → folder tab present,
     dialog usable at `maxWidth xs`.
  7. Explorer after a move → memo under the new folder (fresh mount load).
  8. Tab persistence: select the folder tab → reload the page → folder tab is active
     (existing localStorage tab behavior covers the new id).

## Out of scope
- One-click dropdown menu (v2 candidate if the dialog proves slow).
- Creating/renaming folders from the memo page (Explorer owns folder CRUD).
- Non-memo notes (checklists).
- Reordering within a folder from the memo page (Explorer drag owns `sortOrder`).
- Cross-page cache invalidation (none needed — Explorer is local state).

## Open questions

None remaining. All decisions (D1–D6) confirmed with the user 2026-08-22, including
snackbar wording: "Moved to {folder}" / "Removed from folder".

(Resolved during the Q&A pass: phasing → separate PRs (D6); interaction → dialog, not
dropdown (D1); placement → right-sidebar tab, not top-rail icon (D1); scope → memos
only (D3); current-location display → yes (D2); hardening → Phase 2 (D4).)
