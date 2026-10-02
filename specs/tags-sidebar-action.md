# Spec — Note "Tags" Action Opens the Tags Sidebar

**Status:** APPROVED + VERIFIED (smoke-tested end-to-end in browser, 2026-10-02)
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

Adjacent known bug, **out of scope**: `onEdit={handleTimeTracking}` — "Edit"
opens the same time-entry form. Separate fix.

## Decisions

| Question | Decision |
|---|---|
| Trigger | ⋮ menu action on `NoteItem` rows (desktop popover + mobile bottom sheet). |
| Note not yet open | **Open the note too** — navigate to its route and land with the sidebar on the Tags tab. (The sidebar belongs to the note view; it cannot open without one.) |
| Mechanism | **URL query param** `?sidebar=<tabId>`. `NotePage` consumes it on mount / param change, opens the sidebar at that tab, then strips the param (`replace`). Declarative, deep-linkable, no new context, works whether or not the note is currently mounted. |
| Checklists | **Memos only for this pass** (user decision). The sidebar stays gated to `isMemo`; the Tags action on a checklist note just opens the note. The `?sidebar=tags` param is still emitted (harmlessly ignored by the gate), so the fast follow-up below makes the sidebar appear with no further action-side changes. Backend tag endpoints have **no** memo guard — checklists already carry tags. |
| Label wording | Rename the action **Label → Tags** (icon unchanged). |
| Tag page tree | Wire the same behavior on desktop TagPage note rows (`CustomTagTreeItem`, currently `onLabel={noop}`); the mobile tag list gets it for free via shared `NoteItem`. |

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
- On a checklist note: the note opens; the sidebar (memo-only this pass)
  stays closed.
- `?sidebar=` accepts any valid tab id (`checklist`, `tags`, `folder`,
  `audio`, `time`, `history`); invalid values are ignored.
- Refresh / deep-link with `?sidebar=tags` re-opens the sidebar, then the
  param is stripped from the URL.
- Opening the sidebar this way updates the persisted last-tab
  (`STORAGE_KEYS.NOTE_PAGE.SIDEBAR_TAB`), consistent with existing behavior.
- `updated_at` is **not** bumped by clicking Tags (the timestamp is already
  bumped when the ⋮ menu opens).
- Closing: existing top-rail sidebar toggle (unchanged in this pass).

## Frontend changes

1. **`pages/NotePage/NotePage.tsx`**
   - New `useSearchParams` effect (all hooks before the `isLoading` early
     return): if the `sidebar` param is a valid tab id →
     `setActiveTab(tab)`, `setIsSidebarOpen(true)`, `setIsTagsOpen(true)`
     (mobile), then strip the param via `setSearchParams(next, { replace: true })`.
2. **`pages/HomePage/.../NoteItem/NoteItem.tsx`**
   - New `handleLabel`: close the menu, then navigate to the note under the
     current list route with the sidebar param. Base is
     `location.pathname.split('/notes/')[0]`, normalized to end in `/`
     (mirrors `HomePage.handleNoteSelect`) so `/memo` → `/memo/notes/:id`,
     `/` → `/notes/:id`. Without the trailing slash, `/memo` produced
     `/memonotes/:id`, which the catch-all route silently redirected to Home
     (found in smoke testing). Desktop `replace` / mobile `push`.
   - Wire `onLabel={handleLabel}` (replaces `handleTimeTracking`).
3. **`pages/HomePage/.../NoteItem/NoteActionGrid/NoteActionGrid.tsx`**
   - Action label `"Label"` → `"Tags"` (icon unchanged).
4. **`components/TreeNavigation/CustomTagTreeItem.tsx`**
   - New `handleLabel` → navigate to
     `${ROUTES.TAG_NOTES(tagId)}/notes/${noteId}?sidebar=tags` (fall back to
     Home when `tagId` is null); wire `onLabel={handleLabel}`.

## Out of scope (this pass)

- `onEdit` mis-wiring (Edit opens the time-entry form) — separate fix.
- Right sidebar for checklist notes — fast follow-up below.
- Per-note-type tab filtering in the right sidebar.
- Inline tag chips on list rows; tag management from any surface other than
  the note's sidebar.
- Explorer page note rows (separate menu, no Label action).

## Fast follow-up (after this lands)

Enable the right sidebar for checklist notes:

- `NotePage.tsx`: render gates `note?.isMemo` → `note` (RightSidebar desktop,
  MobileTagsView mobile).
- `TopRailActions.tsx`: remove the outer `if (!note?.isMemo) return null;`
  gate; sidebar toggle (desktop) and side-panel toggle (mobile) render for
  all notes; edit-mode, kanban, and transcription buttons keep their `isMemo`
  gating (a checklist opened from ⋮→Tags must be closable).
- Keep all six tabs; the "checklist" tab on a checklist note duplicates the
  main content (accepted).
- Single commit: `note: enable right sidebar for checklist notes`.

## Commits (small, per user preference)

1. `note: open right sidebar from ?sidebar= query param` — `NotePage.tsx` (effect only)
2. `note: wire Tags action to open tags sidebar` — `NoteItem.tsx`
3. `note: rename Label action to Tags` — `NoteActionGrid.tsx`
4. `tag-tree: open tags sidebar from note row action` — `CustomTagTreeItem.tsx`
5. `note: fix Tags action path for memo and checklist lists` — `NoteItem.tsx`
   (slash-normalized base; without it `/memo` produced `/memonotes/:id` →
   catch-all redirect to Home)

Commit 2 depends on commit 1 for full behavior (without it, the action only
navigates to the note). Commits 3–5 are independent.

## Verification

- `cd frontend && npm run build` (tsc + vite) and `npm run lint`.
- Manual smoke (dev server):
  - Home list → ⋮ → **Tags** on an unopened memo: note opens, sidebar slides
    out on the Tags tab; add an existing tag, create a new tag, remove a tag
    — all persist.
  - ⋮ → **Tags** on the already-open note: sidebar slides out without
    re-mounting the note.
  - Checklists tab → ⋮ → **Tags** on a checklist: note opens, no sidebar
    (memo-only this pass).
  - Mobile viewport: bottom sheet → **Tags** → right drawer with Tags tab.
  - Tag page (desktop) tree row ⋮ → **Tags**: note opens in the right panel
    with the sidebar; mobile tag list same.
  - Refresh a note URL carrying `?sidebar=tags`: sidebar opens, param
    stripped from the URL.
  - Memos page → ⋮ → **Tags**: note opens under `/memo/notes/:id` with the
    sidebar (regression covered by commit 5).

Verified (2026-10-02, live dev servers + headless browser): home / memo /
tag-page flows, mobile bottom sheet + right drawer, deep link, tag
add/remove via UI with API cross-check, sidebar close/reopen, mobile back
button. `npm run build` passes; `npm run lint` crashes in this environment
(pre-existing eslint/minimatch incompatibility, unrelated).
