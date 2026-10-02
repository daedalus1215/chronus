# Spec — Note "Tags" Action Opens the Tags Sidebar

**Status:** APPROVED + VERIFIED (smoke-tested end-to-end in browser, 2026-10-02; fast follow-up landed same day)
**Author:** daedalus1215 + omp

## Why

In the Home/Memos/Checklists note list, each note row's ⋮ overflow menu
(`NoteActionGrid`) has a **Label** action. It is mis-wired in
`NoteItem.tsx` (`onLabel={handleTimeTracking}`), so clicking it opens the
**time-entry dialog** (date / start time / duration form) instead of letting
the user tag the note.

The right sidebar (`RightSidebar`, desktop / `MobileTagsView`, mobile) already
exists on the note view with a fully functional **Tags** tab
(`SidebarTagsView` + `AddTagForm`: add existing, create new, remove). The fix
is to point the action at that surface instead of the time form.

- `onEdit={handleTimeTracking}` ("Edit" opened the same time-entry form) was
  fixed as part of the fast follow-up: Edit now opens the note in edit mode.

## Decisions

| Question | Decision |
|---|---|
| Trigger | ⋮ menu action on `NoteItem` rows (desktop popover + mobile bottom sheet). |
| Note not yet open | **Open the note too** — navigate to its route and land with the sidebar on the Tags tab. (The sidebar belongs to the note view; it cannot open without one.) |
| Mechanism | **URL query param** `?sidebar=<tabId>`. `NotePage` consumes it on mount / param change, opens the sidebar at that tab, then strips the param (`replace`). Declarative, deep-linkable, no new context, works whether or not the note is currently mounted. |
| Checklists | Sidebar enabled for **all** notes (fast follow-up landed). The Tags action works identically on checklists. Backend tag endpoints have **no** memo guard — checklists already carry tags. Edit-mode, kanban, and transcription controls remain memo-only. |
| Label wording | Rename the action **Label → Tags** (icon unchanged). |
| Tag page tree | Wire the same behavior on desktop TagPage note rows (`CustomTagTreeItem`, which had `onLabel`/`onEdit={noop}`); the mobile tag list gets it for free via shared `NoteItem`. |

## Behavior

- Click ⋮ on a memo → **Tags**:
  - Menu closes.
  - If the note is not open: it opens (desktop: `replace`, matching list
    selection; mobile: `push`, so back returns to the list).
  - The right sidebar slides out (desktop 320px panel / mobile right drawer)
    with the **Tags** tab active.
  - The user can immediately add existing tags, create a new tag, or remove a
    tag — no new tag UI, the existing `SidebarTagsView` is reused.
- Clicking Tags on the already-open note: sidebar opens on the Tags tab; the
  only URL change is the transient query param.
- Clicking Tags on a checklist note: the note opens and the sidebar opens on
  the Tags tab (same as memos).
- `?sidebar=` accepts any valid tab id (`checklist`, `tags`, `folder`,
  `audio`, `time`, `history`); invalid values are ignored.
- Refresh / deep-link with `?sidebar=tags` re-opens the sidebar, then the
  param is stripped from the URL.
- Opening the sidebar this way updates the persisted last-tab
  (`STORAGE_KEYS.NOTE_PAGE.SIDEBAR_TAB`), consistent with existing behavior.
- `updated_at` is **not** bumped by clicking Tags (the timestamp is already
  bumped when the ⋮ menu opens).
- Closing: existing top-rail sidebar toggle (unchanged in this pass). Checklists also render the toggle (fast follow-up).

## Frontend changes

1. **`pages/NotePage/NotePage.tsx`**
   - New `useSearchParams` effect (all hooks before the `isLoading` early
     return): consumes two params:
     - `sidebar=<tabId>` (valid tab id) → `setActiveTab(tab)`,
       `setIsSidebarOpen(true)`, `setIsTagsOpen(true)` (mobile).
     - `edit=1` → `setIsEditMode(true)`.
     - Then strips both params via `setSearchParams(next, { replace: true })`.
2. **`pages/HomePage/.../NoteItem/NoteItem.tsx`**
   - New `handleLabel`: close the menu, then navigate to the note under the
     current list route with the sidebar param. Base is
     `location.pathname.split('/notes/')[0]`, normalized to end in `/`
     (mirrors `HomePage.handleNoteSelect`) so `/memo` → `/memo/notes/:id`,
     `/` → `/notes/:id`. Without the trailing slash, `/memo` produced
     `/memonotes/:id`, which the catch-all route silently redirected to Home
     (found in smoke testing). Desktop `replace` / mobile `push`.
   - Wire `onLabel={handleLabel}` (replaces `handleTimeTracking`).
   - New `handleEdit`: close the menu, navigate to the same note route with
     `?edit=1`. Wire `onEdit={handleEdit}` (replaces the
     `handleTimeTracking` mis-wire; for checklists the param is consumed as a
     no-op — checklists have no edit mode).
3. **`pages/HomePage/.../NoteItem/NoteActionGrid/NoteActionGrid.tsx`**
   - Action label `"Label"` → `"Tags"` (icon unchanged).
4. **`components/TreeNavigation/CustomTagTreeItem.tsx`**
   - New `handleLabel` → navigate to
     `${ROUTES.TAG_NOTES(tagId)}/notes/${noteId}?sidebar=tags` (fall back to
     Home when `tagId` is null); wire `onLabel={handleLabel}`.
   - New `handleEdit` → same route with `?edit=1`; wire `onEdit={handleEdit}`
     (replaces `onEdit={noop}`).
5. **`pages/NotePage/components/TopRailActions/TopRailActions.tsx`**
   - Removed the outer `if (!note?.isMemo) return null;` gate. Sidebar toggle
     (desktop) and side-panel toggle (mobile) render for **all** notes;
     edit-mode toggle, kanban, and transcription keep their `isMemo` gates.
   - Checklists previously rendered **no** top-rail actions at all, so a
     checklist opened via ⋮→Tags had no way to close the sidebar.

## Out of scope (this pass)

- ~~`onEdit` mis-wiring~~ — fixed (commit 7): Edit opens the note in edit mode.
- ~~Right sidebar for checklist notes~~ — fixed (commit 6).
- Per-note-type tab filtering in the right sidebar.
- Inline tag chips on list rows; tag management from any surface other than
  the note's sidebar.
- Explorer page note rows (separate menu, no Label action).

## Fast follow-up — LANDED (2026-10-02, same session)

Enable the right sidebar for checklist notes:

- `NotePage.tsx`: render gates `note?.isMemo` → `note` (RightSidebar desktop,
  MobileTagsView mobile).
- `TopRailActions.tsx`: remove the outer `if (!note?.isMemo) return null;`
  gate; sidebar toggle (desktop) and side-panel toggle (mobile) render for
  all notes; edit-mode, kanban, and transcription buttons keep their `isMemo`
  gating (a checklist opened from ⋮→Tags must be closable).
- Keep all six tabs; the "checklist" tab on a checklist note duplicates the
  main content (accepted).

Plus the `onEdit` mis-wire fix (Edit → edit mode, `?edit=1` param):

- `NotePage.tsx`: the param effect also consumes `edit=1` →
  `setIsEditMode(true)`.
- `NoteItem.tsx` + `CustomTagTreeItem.tsx`: new `handleEdit` navigates to
  the note with `?edit=1`.

Verified: checklist ⋮→Tags opens the sidebar with the tag list + Add tag;
adding a tag persists (UI + `GET /api/tags/note/:id` cross-check); checklist
⋮→Edit opens the note with no edit UI (param no-op); memo ⋮→Edit (list and
tag tree) opens edit mode; deep links `?sidebar=`, `?edit=`, and both
combined apply then strip; mobile bottom-sheet ⋮→Edit opens edit mode.

## Commits (small, per user preference)

1. `note: open right sidebar from ?sidebar= query param` — `NotePage.tsx` (effect only)
2. `note: wire Tags action to open tags sidebar` — `NoteItem.tsx`
3. `note: rename Label action to Tags` — `NoteActionGrid.tsx`
4. `tag-tree: open tags sidebar from note row action` — `CustomTagTreeItem.tsx`
5. `note: fix Tags action path for memo and checklist lists` — `NoteItem.tsx`
   (slash-normalized base; without it `/memo` produced `/memonotes/:id` →
   catch-all redirect to Home)
(docs) `docs: record verified status and path fix in tags spec`
6. `note: enable right sidebar for checklist notes` — `NotePage.tsx`
   (render gates) + `TopRailActions.tsx` (remove outer memo gate)
7. `note: wire Edit action to open note in edit mode` — `NotePage.tsx`
   (`?edit=1` consumption), `NoteItem.tsx` + `CustomTagTreeItem.tsx`
   (`handleEdit`)

Commit 2 depends on commit 1 for full behavior (without it, the action only
navigates to the note). Commits 3–5 are independent. Commit 7 depends on
commit 6 for the checklist-close case only; the memo Edit flow works without it.

## Verification

- `cd frontend && npm run build` (tsc + vite) and `npm run lint`.
- Manual smoke (dev server):
  - Home list → ⋮ → **Tags** on an unopened memo: note opens, sidebar slides
    out on the Tags tab; add an existing tag, create a new tag, remove a tag
    — all persist.
  - ⋮ → **Tags** on the already-open note: sidebar slides out without
    re-mounting the note.
  - Checklists tab → ⋮ → **Tags** on a checklist: note opens **with** the
    sidebar on the Tags tab (commit 6).
  - ⋮ → **Edit** on a memo (list and tag tree): note opens in edit mode;
    deep link `?edit=1` same; on a checklist the param is a no-op.
  - Mobile viewport: bottom sheet → **Tags** → right drawer with Tags tab.
  - Tag page (desktop) tree row ⋮ → **Tags**: note opens in the right panel
    with the sidebar; mobile tag list same.
  - Refresh a note URL carrying `?sidebar=tags`: sidebar opens, param
    stripped from the URL.
  - Memos page → ⋮ → **Tags**: note opens under `/memo/notes/:id` with the
    sidebar (regression covered by commit 5).

Verified (2026-10-02, live dev servers + headless browser), both passes:
home / memo / checklist / tag-page flows; mobile bottom sheet + right
drawer; deep links (`?sidebar=`, `?edit=`, combined) applying then stripping;
tag add/remove via UI with API cross-check; sidebar close/reopen; mobile
back button; checklist sidebar (tags list + add tag) and Edit → edit mode
(memo list, memo tag tree, checklist no-op, mobile sheet). `npm run build`
passes; `npm run lint` crashes in this environment (pre-existing
eslint/minimatch incompatibility, unrelated).
