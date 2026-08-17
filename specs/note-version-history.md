# Spec — Note Version History

**Status:** Draft / gathering requirements
**Branch:** _TBD_ (feature not started)
**Author:** daedalus1215 + Hermes Agent

Keep a history of the last 20 saved versions of a memo note's description.
Browse past versions in a sidebar timeline. Click a version to load it into the
editor; edit and save creates a new version entry.

---

## TL;DR

Every time a memo note is auto-saved, snapshot the *previous* description into a
`note_versions` table. Keep the last 20 per note. Expose a "History" tab in the
note page sidebar showing the timeline. Click a version to load it into the
editor — edit and save creates a new version. No separate restore button.

---

## Decisions locked

| # | Decision | Choice |
|---|----------|--------|
| 1 | **Version capture trigger** | On every save — snapshot the *previous* description before the mutation. V1 starts on the second save (first save has no previous state to capture). |
| 2 | **Content versioned** | Description only. Title, tags, and check-items are not versioned. Restoring a version keeps the current title — title mismatch is acceptable. |
| 3 | **Cap** | 20 versions per note, hard cap, oldest evicted on overflow. |
| 4 | **Dedupe identical saves** | Skip if description is byte-identical to the latest version. |
| 5 | **History UI location** | New tab in the existing RightSidebar (desktop) and MobileTagsView (mobile). |
| 6 | **Version listing** | Version number + timestamp ("v19 — Aug 16, 2026 at 3:42 PM"). |
| 7 | **Click behavior** | Clicking a version loads its description into the editor as unsaved/dirty state. No save happens until the user edits. The existing "Back" behavior discards unsaved changes. |
| 8 | **Auto-save** | No explicit Save button for version content. When the user enters any character (debounced), the note is auto-saved — which creates a new version entry. Loading a version without editing does not create a version. |
| 9 | **Scope** | Memo notes only. Checklist notes are not versioned in v1. |
| 10 | **Real-time sync** | React Query invalidation on note update auto-refreshes the sidebar version list. |
| 11 | **Mobile** | Same experience as desktop — sidebar tab on desktop, collapsible panel on mobile. |

### Remaining decisions

| # | Decision | Choice |
|---|----------|--------|
| 12 | **Auto-save debounce** | 2s — matches existing editor auto-save behavior. |
| 13 | **Loaded version indicator** | Subtle indicator in editor header ("Loaded from v10") that clears on save. |
| 14 | **Sidebar state on version load** | Sidebar stays open; the loaded version row is highlighted. |
| 15 | **Checklist note handling** | History tab shown but disabled with message: "Versioning not available for checklists." |
| 16 | **No-edit navigation** | Silently discard — clicking another version or navigating away without editing discards the loaded content. No prompt. |
| 17 | **Version count** | Show "15 / 20 versions" in the sidebar header. |

---

## Proposed design (grounded in current code)

### Data model — new entity

**`note_versions` table:**

```sql
CREATE TABLE "note_versions" (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id       INTEGER NOT NULL REFERENCES "notes"(id) ON DELETE CASCADE,
  version_num   INTEGER NOT NULL,          -- monotonic per note, starts at 1
  description   TEXT NOT NULL,             -- memo description snapshot
  created_at    TEXT NOT NULL              -- ISO timestamp of snapshot
);

CREATE INDEX "idx_note_versions_note_id" ON "note_versions"(note_id);
CREATE INDEX "idx_note_versions_version_num" ON "note_versions"(note_id, version_num DESC);
```

- `version_num` is per-note, monotonically increasing. After 20, the oldest is
  deleted and the counter keeps incrementing (no wrap).
- **Memo notes only** — `description` is always populated. No checklist support in v1.
- **No `user_id`** — ownership derived through `note_id → notes.user_id` (same
  pattern as `note_audios`).

### Backend changes

#### 1. New entity

`backend/src/notes/domain/entities/notes/note-version.entity.ts`

Standard TypeORM entity mirroring the table above.

#### 2. New repository

`backend/src/notes/infra/repositories/note-version.repository.ts`

Methods:
- `create(noteId, versionNum, description)` — insert
- `findByNoteId(noteId, userId)` — return all versions ordered by `versionNum DESC`
- `findById(id, noteId, userId)` — single version
- `deleteOldestBeyond(noteId, keep)` — evict oldest beyond the cap
- `getLatestVersionNum(noteId)` — max version_num for counter
- `getLatestDescription(noteId)` — for dedupe check

#### 3. New transaction script

`backend/src/notes/domain/transaction-scripts/save-note-version-TS/save-note-version.transaction.script.ts`

Called from the update note flow. Before `UpdateNoteTransactionScript.apply()`:
1. Read the current note description (memo only)
2. Skip if description is byte-identical to the latest version (decision #4)
3. Get next version number
4. Insert the snapshot
5. Evict beyond cap

This script is **not** a public API — it's an internal hook called by
`UpdateNoteTransactionScript`. Wire it in by injecting
`SaveNoteVersionTransactionScript` into `UpdateNoteTransactionScript` and
calling it before the save.

#### 4. New actions

**List versions:**
`GET /notes/:id/versions` — returns `NoteVersionResponseDto[]` for the note,
plus a `{ total: number }` count. Authenticated via JWT, ownership verified.

`backend/src/notes/apps/actions/notes/get-note-versions-action.ts`

**Get single version:**
`GET /notes/:noteId/versions/:versionId` — returns a single version.

`backend/src/notes/apps/actions/notes/get-note-version-by-id-action.ts`

**Load version (restore):**
`POST /notes/:noteId/versions/:versionId/load` — sets the note's current
description to the version's description. This is a normal save operation that
triggers a new version snapshot (decision #8).

`backend/src/notes/apps/actions/notes/load-note-version-action.ts`

#### 5. DTOs

`backend/src/notes/apps/dtos/responses/note-version.response.dto.ts`

```typescript
export class NoteVersionResponseDto {
  id: number;
  versionNum: number;
  description: string;
  createdAt: string;
}
```

#### 6. Migration

`backend/src/typeorm/migrations/<timestamp>-create__note_versions__table.ts`

Standard TypeORM migration creating the table and indexes.

### Frontend changes

#### 1. New API requests

`frontend/src/pages/NotePage/api/versions.requests.ts`

- `fetchNoteVersions(noteId)` — `GET /notes/:id/versions`
- `loadNoteVersion(noteId, versionId)` — `POST /notes/:noteId/versions/:versionId/load`

#### 2. New hook

`frontend/src/pages/NotePage/hooks/useNoteVersions/useNoteVersions.ts`

React Query hook. `useQuery` for the version list; `useMutation` for
`loadNoteVersion`. On load, invalidates `['note', noteId]` so the editor
reflects the loaded version.

#### 3. New sidebar tab

Add a "History" tab to the `sidebarTabs` array in `NotePage.tsx`:

```typescript
const sidebarTabs = [
  { id: 'checklist', icon: <ChecklistOutlined /> },
  { id: 'tags', icon: <LocalOfferIcon /> },
  { id: 'audio', icon: <HeadsetMicOutlined /> },
  { id: 'time', icon: <AccessTimeOutlined /> },
  { id: 'history', icon: <HistoryOutlined /> },
];
```

The tab is shown for memo notes. For checklist notes, the tab is present but
disabled with the message "Versioning not available for checklists." (decision #15)

#### 4. Version history panel

`frontend/src/pages/NotePage/components/SidebarNoteHistoryView/`

```
SidebarNoteHistoryView/
  SidebarNoteHistoryView.module.css
  SidebarNoteHistoryView.tsx
```

- Header: "N / 20 versions" (decision #17)
- Vertical list, newest first
- Each row: version number, formatted timestamp, short description preview
  (first 50 chars)
- Clicking a row calls `loadNoteVersion` — sets the note's description to the
  version's content via `updateNote`. Sidebar stays open; clicked row is
  highlighted (decision #14).
- A "Loaded from v10" indicator appears in the editor header and clears on the
  next save (decision #13).
- Clicking away from the sidebar or loading another version silently discards
  any unsaved edits (decision #16).

#### 5. State management

Add to `NotePage.tsx`:

```typescript
const [loadedFromVersion, setLoadedFromVersion] = useState<number | null>(null);
```

When a version is loaded:
- `loadedFromVersion` is set to the version number (for the indicator)
- The description is set via the existing `updateNote` call
- On the next save, `loadedFromVersion` is cleared

No separate "read-only view" or "back to current" — the loaded version *is* the
editor content. If the user wants to return to the current version, they scroll
the sidebar and click the most recent entry.

### Key reference files

- Entity: `backend/src/notes/domain/entities/notes/note.entity.ts` (pattern)
- Repository: `backend/src/notes/infra/repositories/note-memo-tag.repository.ts`
- Transaction script: `backend/src/notes/domain/transaction-scripts/update-note-TS/update-note.transaction.script.ts`
- Action: `backend/src/notes/apps/actions/notes/get-note-by-id-action.ts` (pattern)
- DTO: `backend/src/notes/apps/dtos/responses/note.response.dto.ts`
- Migration: `backend/src/typeorm/migrations/1775800000001-alter__add_folder_id_column__notes_table.ts` (pattern)
- Note page: `frontend/src/pages/NotePage/NotePage.tsx`
- Sidebar tab: `frontend/src/pages/NotePage/components/SidebarTagsView/SidebarTagsView.tsx` (pattern)
- Read view: `frontend/src/pages/NotePage/components/NoteReadView/DesktopNoteReadView/DesktopNoteReadView.tsx`
- API requests: `frontend/src/pages/NotePage/api/requests.ts`
- Note hook: `frontend/src/pages/NotePage/hooks/useNote/useNote.ts`

---

## Implementation order

1. **Migration** — create `note_versions` table
2. **Entity + Repository** — `NoteVersion` entity and repository
3. **Version capture hook** — `SaveNoteVersionTransactionScript`, wired into
   `UpdateNoteTransactionScript` (memo only)
4. **List/Load actions** — `GET /notes/:id/versions` and `POST
   /notes/:noteId/versions/:versionId/load`
5. **Frontend API + hook** — requests and `useNoteVersions`
6. **Sidebar panel** — `SidebarNoteHistoryView` component + tab registration
7. **Editor indicator** — "Loaded from vN" state, cleared on save

---

## Edge cases & validation

1. **First save:** A newly created note has no previous state — skip versioning
   on first create. Only version on subsequent saves (decision #1).
2. **Empty description:** A save that clears the description is still a version
   (content changed from something to nothing).
3. **Concurrent edits:** Two tabs saving simultaneously. Both create versions
   independently — no conflict because versions are append-only. The last save
   wins for live content (existing behavior).
4. **Archived notes:** Version history still accessible for archived notes. No
   special handling needed — the foreign key cascade is `ON DELETE CASCADE` on
   the note, so archiving (soft delete) preserves versions.
5. **Note deletion:** If a note is hard-deleted, all versions cascade-delete
   automatically via the FK constraint.
6. **Cap enforcement:** When evicting, delete in a single query:
   `DELETE FROM note_versions WHERE note_id = ? AND version_num IN (SELECT
   version_num FROM note_versions WHERE note_id = ? ORDER BY version_num ASC
   LIMIT ?)`. This is safe even if called concurrently.
7. **Description-only dedupe:** The dedupe check compares only the description
   (decision #2). A title-only save on a memo does NOT create a version.
8. **Load without edit:** Clicking a version loads it into the editor as dirty
   state. If the user navigates away or clicks another version without typing,
   the loaded content is silently discarded (decision #16).

---

## Out of scope (future)

- **Visual diff:** Side-by-side or unified diff between versions. A v2 feature
  that would be valuable for understanding what changed.
- **Pinned versions:** Let the user mark specific versions as "keep forever"
  (beyond the 20 cap).
- **Export version:** Download a specific version as `.chronus`.
- **Version comments:** Let the user annotate a version ("before refactor").
- **Cross-note versioning:** Tag and folder history.
- **WebSocket broadcast:** Real-time version notifications to other tabs.
