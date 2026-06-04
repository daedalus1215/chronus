# Memo Export / Import Feature Specification

## Overview

This document outlines the implementation plan for adding **export** and **import** functionality for memos in the chronus-react-nestjs application. The goal is to let a user export a single memo to a portable file that captures all of its core content — title, description, time-tracking history, checklists, and tags — and import it into another Chronus instance.

Import is not all-or-nothing: the user can **cherry-pick** which pieces to bring in, and can either create a brand-new memo or **merge selected pieces into an existing memo** on the target instance.

## Goals

- Export a memo, one note at a time, to a self-contained `.chronus` file.
- The file is portable across instances: it carries semantic content only — no database IDs, no `userId`, no instance-specific references.
- Import a file as a **new memo**, choosing which sections to include.
- Merge selected pieces from a file into an **existing memo** (v2).
- No schema/migration changes — all required tables already exist.

## Non-Goals (v1/v2)

- Audio attachments (binary blobs need a separate transport strategy — deferred).
- Folder placement on import (imported memos land at root; user moves them afterward).
- Bulk export of multiple memos in one file.
- Cross-instance ID stability / sync (every import creates new rows).

---

## Module Structure

### This is a NEW module: `note-transfer`

Export/import is a **cross-cutting concern**. A single operation must read from and write to four existing modules:

- `notes` — Note (title) + Memo (description)
- `check-items` — CheckItem rows for the note
- `time-tracks` — TimeTrack rows for the note
- `tags` / `shared-kernel` — Tag + TagNote join rows

Putting this in the `notes` module would force `notes` to depend on `check-items`, `time-tracks`, and `tags`, bloating it and inverting the current dependency direction. Instead, a dedicated **`note-transfer`** module orchestrates the others — but **only through the architecture's sanctioned cross-module channels** (see next section), never by importing foreign repositories or services.

> **Convention note:** the codebase uses `apps/actions` (plural) and `domain/transaction-scripts/`, even though `CLAUDE.md` documents `app/actions`. This spec follows the actual on-disk convention.

### Architectural constraints (enforced by dependency-cruiser)

The fitness checks in `backend/rules/` are non-negotiable. The relevant ones:

- **`domain-boundaries.rules.ts`** — a module may reach another module **only** through aggregators (`*.aggregator.*`), ports (`*.port.*`), or module files. Direct imports of a foreign repository/service/transaction-script are violations.
- **`transaction-scripts.rules.ts`** — a transaction script may **not** depend on domain services, other transaction scripts, or aggregators (ports are the one exception). It only touches **its own module's** repositories.

`note-transfer` owns no entities of its own, so it has no repositories and its domain logic is pure orchestration + mapping. That orchestration therefore lives in a **domain service** (`NoteTransferService`), which is the only layer allowed to fan out across modules. The cross-module mechanisms it uses:

| Direction | Mechanism | Precedent in codebase |
|-----------|-----------|------------------------|
| **Read** other modules' data | Inject their **aggregator** | `NoteService` injects `CheckItemsAggregator` |
| **Write** to other modules (need return value) | **Port** defined in `note-transfer`, **adapter** implemented by the provider module | audio's `NoteOwnershipPort` ← notes' `NoteOwnershipAdapter` |
| **Write** as fire-and-forget side effect | **Cross-domain command** event via `EventEmitter` | `DELETE_CHECK_ITEMS_BY_NOTE_COMMAND` |

Because import/merge must create rows and get back their identities (e.g. the new `noteId` to navigate to), writes use **ports + adapters** (synchronous, returns values), not events.

### Directory layout

```
backend/src/note-transfer/
├── note-transfer.module.ts
├── apps/
│   ├── actions/
│   │   ├── export-note-action/
│   │   │   └── export-note.action.ts            GET  /notes/:id/export
│   │   ├── import-note-action/
│   │   │   ├── import-note.action.ts            POST /notes/import
│   │   │   └── dtos/
│   │   │       └── import-note.dto.ts
│   │   └── merge-into-note-action/
│   │       ├── merge-into-note.action.ts        POST /notes/:id/merge
│   │       └── dtos/
│   │           └── merge-into-note.dto.ts
│   └── dtos/
│       └── responses/
│           └── note-export.response.ts          shared export payload shape
└── domain/
    ├── services/
    │   └── note-transfer.service.ts             orchestrator (Action → Service)
    └── ports/
        ├── note-writer.port.ts                  create note+memo / replace description
        ├── check-item-writer.port.ts            read + bulk-create check items
        ├── time-track-writer.port.ts            read + bulk-create time tracks
        └── tag-attacher.port.ts                 read tag names + attach by name
```

> Note: no transaction scripts in `note-transfer` — it has no repositories of its own to drive. The actions call `NoteTransferService`, which coordinates aggregators (reads) and the ports above (writes).

### Provider-side additions (in the existing modules)

Each provider module gains the adapter that satisfies a `note-transfer` port, wired in its own `*.module.ts` with a DI token (the `useExisting` pattern already used by `NoteOwnershipAdapter`). Reads reuse existing aggregators where present; new aggregator methods/ports are added only where a capability is missing:

| Module | Read (aggregator) | Write (adapter implementing a note-transfer port) |
|--------|-------------------|----------------------------------------------------|
| `notes` | `NoteAggregator` (note + memo) — exists | `NoteWriterAdapter` → `NoteWriterPort` (create note+memo; replace memo description) |
| `check-items` | `CheckItemsAggregator` — exists | `CheckItemWriterAdapter` → `CheckItemWriterPort` (bulk create) |
| `time-tracks` | **new** `TimeTracksAggregator` (read note's logs) | `TimeTrackWriterAdapter` → `TimeTrackWriterPort` (bulk create) |
| `tags` | **new** read for tag names by note | `TagAttacherAdapter` → `TagAttacherPort` (resolve-or-create by name, attach) |

`note-transfer.module.ts` imports the provider modules so Nest can resolve the port tokens.

---

## File Format

A single `.chronus` file: JSON with a custom extension. The export is always **full fidelity** — it contains everything. Selection happens at import time, so one export file can serve any import scenario.

```json
{
  "version": 1,
  "exportedAt": "2026-06-03T12:00:00Z",
  "memo": {
    "name": "My Project Notes",
    "description": "Full memo body text...",
    "tags": ["backend", "planning"],
    "checkItems": [
      {
        "name": "Write tests",
        "description": null,
        "status": "in_progress",
        "order": 0,
        "doneDate": null,
        "archiveDate": null
      }
    ],
    "timeTracks": [
      { "date": "2026-06-01", "startTime": "09:00", "durationMinutes": 90 }
    ]
  }
}
```

**Intentionally excluded** (instance-specific or out of scope): `id`, `userId`, `noteId`, `folderId`, `archivedAt`, `sortOrder`, `createdAt`, `updatedAt`, audio.

**Forward compatibility:** unknown top-level keys are ignored on import. `version` is validated against a supported set.

---

## Export

### Triggering — note by note

Export is always scoped to a **single memo**. There is no bulk export in v1.

- **Entry point:** an **Export** action in the memo's toolbar/action menu (alongside Archive).
- **Endpoint:** `GET /notes/:id/export`
- No request body, so no request DTO (per project convention).
- **Response:** `application/json` body with header
  `Content-Disposition: attachment; filename="{sanitized-name}.chronus"`
- Non-destructive — no confirmation dialog needed.

### `NoteTransferService.exportNote(noteId, userId)` — read orchestration

All reads go through the provider modules' **aggregators**; no foreign repositories are touched.

1. Verify ownership via `NoteAggregator` (existing `getReference`/`belongsToUser` throws 404/403).
2. Load the note (title) + memo (description) via `NoteAggregator`.
3. Load all **non-archived** check items via `CheckItemsAggregator` (ordered by `order`).
4. Load all time tracks via the new `TimeTracksAggregator`.
5. Resolve tag **names** via the new tags read (aggregator/port).
6. Assemble the `NoteExport` payload (see File Format) and return it.

The `export-note.action.ts` calls this service method and sets the download headers.

### Frontend export flow

1. User clicks **Export** on a memo.
2. `GET /notes/:id/export` → receive the file.
3. Trigger a browser download of the `.chronus` file (blob + anchor download).

---

## Import — Create New Memo (v1)

### Selection picker

The frontend parses the `.chronus` file **locally** and renders a preview/selection screen. Only the selected subset is sent to the backend.

```
Import "My Project Notes"
─────────────────────────────
☑ Title & description
☑ Tags (2)          [☑ backend] [☑ planning]
Checklists (4)      ☑ select all
  ☑ Write tests          in_progress
  ☑ Review PR            ready
  ☐ Deploy               done
  ☑ Update changelog     ready
Time logs (12)      ☑ select all
  ☑ 2026-06-01  09:00  90m
  ☐ 2026-06-02  10:00  45m
─────────────────────────────
          [Cancel]  [Import selected]
```

- **Entry point:** an **Import Memo** action (e.g. in the sidebar "New" menu).
- File picker restricted to `.chronus`.
- The already-filtered payload is sent to `POST /notes/import`.

### `import-note.dto.ts`

Validated with `class-validator`. Mirrors the file's `memo` object, but every section is optional (the user may have deselected it):

```ts
{
  version: number;                 // must be a supported version
  name: string;                    // required, max 255
  description?: string;
  tags?: string[];
  checkItems?: Array<{
    name: string;
    description?: string | null;
    status: 'ready' | 'in_progress' | 'review' | 'done';
    order: number;
    doneDate?: string | null;
    archiveDate?: string | null;
  }>;
  timeTracks?: Array<{
    date: string;                  // YYYY-MM-DD
    startTime: string;             // HH:mm
    durationMinutes: number;       // positive integer
  }>;
}
```

### `NoteTransferService.importNote(payload, userId)` — write orchestration

`class-validator` validates the DTO at the action boundary. The service then fans out through **ports** (each implemented by a provider-module adapter):

1. `NoteWriterPort.createNoteWithMemo(name, description, userId)` → returns the new `noteId`.
2. `CheckItemWriterPort.bulkCreate(noteId, items)` — preserves `order` and `status`.
3. `TimeTrackWriterPort.bulkCreate(noteId, userId, logs)`.
4. `TagAttacherPort.attachByName(noteId, userId, tagNames)` — resolve-or-create, then attach via TagNote (dedup by name lives in the adapter).
5. Return the new `noteId` so the frontend can navigate to it.

Steps 2–4 run only for the sections the user kept. (Atomicity note: SQLite + TypeORM can wrap this in a transaction inside the `NoteWriterAdapter` or via a unit-of-work; if cross-adapter transactions prove awkward, the fallback is best-effort ordering — create the note first, then children — since a partial import is still a usable note the user can re-run.)

### Frontend create flow

1. User picks a `.chronus` file → file parsed locally → selection picker shown.
2. On confirm: `POST /notes/import` with the filtered payload.
3. On success: navigate to the new memo.
4. On validation error: show an inline error, keep the picker open.

---

## Import — Merge Into Existing Memo (v2)

The more powerful flow: pull **specific pieces** from a file into a memo that already exists.

### Entry point — on the memo itself

Decision: the merge entry point lives **on the target memo**. The user opens the memo they want to merge into, then clicks **Import into this memo** in its toolbar/menu and selects a `.chronus` file.

### Merge picker

Same selection UI as v1, scoped to mergeable parts:

- **Description** — *replace* the existing memo description with the imported one. Off by default; when checked, it overwrites (not appends).
- **Time logs** — pick specific ones to append.
- **Checklists** — pick specific ones to append.
- **Tags** — pick specific ones to attach.

#### Duplicate handling

- **Time logs — warn on exact match.** As the picker renders, it cross-references each incoming log against the target memo's **current** time logs (already loaded with the memo detail). Any incoming log matching an existing `date + startTime + durationMinutes` gets a **"possible duplicate"** badge. The user can still choose to import it — the warning never blocks.
- **Tags — dedup by name.** Attaching an already-present tag is a no-op.
- **Check items — append blindly.** Two items with the same name are legitimately distinct tasks.

### Endpoint & DTO

`POST /notes/:id/merge`

`merge-into-note.dto.ts` carries only the picked pieces; all fields optional:

```ts
{
  version: number;
  description?: string;            // when present → REPLACE existing memo description
  tags?: string[];
  checkItems?: Array<{ name; description?; status; order; doneDate?; archiveDate?; }>;
  timeTracks?: Array<{ date; startTime; durationMinutes; }>;
}
```

### `NoteTransferService.mergeIntoNote(noteId, payload, userId)` — write orchestration

Same port-based fan-out as import, scoped to the selected pieces:

1. Verify ownership via `NoteAggregator` (404/403 on miss).
2. If `description` is present → `NoteWriterPort.replaceDescription(noteId, description)` (the adapter creates the Memo if the note doesn't have one yet).
3. `TimeTrackWriterPort.bulkCreate(noteId, userId, logs)` — additive; no server-side dedup (the "possible duplicate" warning lives in the picker).
4. `CheckItemWriterPort.bulkCreate(noteId, items)` — the adapter re-bases `order` onto the end of the existing list so values don't collide.
5. `TagAttacherPort.attachByName(noteId, userId, tagNames)` — skips any already attached.
6. Return success.

Reuses the exact same ports/adapters as import — the merge action just feeds them an existing `noteId` instead of a freshly created one.

### Frontend merge flow

1. From an open memo, user clicks **Import into this memo** → file picker.
2. File parsed locally; picker shows mergeable parts with duplicate-warning badges on time logs.
3. On confirm: `POST /notes/:id/merge` with the selected pieces.
4. On success: refresh the memo view.

---

## Migration

**None required.** All entities — `Note`, `Memo`, `CheckItem`, `TimeTrack`, `Tag`, `TagNote` — already exist and support every field in scope.

---

## Build Order

Each stage ships something usable, and the file format never changes between stages.

1. **Stage 1 — Export + import-all (create).**
   Scaffold the `note-transfer` module + `NoteTransferService`, the read aggregators (new `TimeTracksAggregator`, tags read) and the write ports/adapters (`NoteWriterPort`, `CheckItemWriterPort`, `TimeTrackWriterPort`, `TagAttacherPort`). Then `GET /notes/:id/export` and `POST /notes/import` (no picker; imports everything).
   Proves the file format, the full round-trip, **and** that the dependency-cruiser fitness checks pass with the new cross-module wiring.

2. **Stage 2 — Selective create picker.**
   Frontend-only change: parse the file, show the selection UI, send a filtered payload. Backend already accepts a partial payload.

3. **Stage 3 — Merge into existing memo (v2).**
   `POST /notes/:id/merge`, the "Import into this memo" entry point, the merge picker, description-replace, and the time-log duplicate warning.

---

## Open Questions / Future

- Audio export/import (binary transport).
- Bulk export (a folder or a selection of memos → one archive).
- Optional dedup strategies for check items if duplicates become a nuisance.
- "Append to bottom" mode for description merge, as an alternative to replace.
