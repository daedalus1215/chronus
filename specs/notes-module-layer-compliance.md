# Spec — notes module: layer compliance (Action → Service → TS → Repository)

**Status:** Implemented (2026-09-18, commits 48b120d..547b75a on top of 62a92c2)
**Implementation repo:** `~/Projects/chronus-frontend-backend` (backend only; frontend untouched)
**Author:** daedalus1215 + Hermes
**Source report:** Metatron module scan of `notes/` (2026-09-18)

## Why this exists

A Metatron scan of `src/notes/` flagged 8 deviation classes. This spec addresses the six that
are real code changes, on the grounds that `AGENTS.md` §1.1 makes the layering
non-negotiable: **"Actions call Services only; Services orchestrate Transaction Scripts;
domain logic lives in Transaction Scripts; Repositories are data-only."**

Confirmed against HEAD `62a92c2` (2026-09-17) by reading the code:

1. **Four Actions inject a Transaction Script directly** (skip Service):
   `create-note`, `move-note-to-folder`, `reorder-notes`, `update-note-title`.
2. **Five Actions inject a Repository directly** (skip Service *and* TS):
   `get-note-names-by-userId`, `get-note-names-for-explorer`, `get-note-versions`,
   `load-note-version`, `update-note-timestamp`.
3. **`NoteService.deleteNote` executes a write use case on the repository directly**
   (find → two cross-domain events → delete) — the same class of violation the
   users-register spec fixed in `UsersService.register`.
4. **Two TSs use a non-canonical file suffix** (`.transaction-script.ts` instead of
   `.transaction.script.ts`).
5. **One dead file:** `apps/dtos/responses/check-item.response.dto.ts` is an orphaned
   duplicate of the check-items module's DTO of the same name — zero importers.
6. **Circular import `memo.entity.ts <-> note.entity.ts`:** the `Memo.note` back-reference
   is never accessed anywhere in `src/` (verified by grep); deleting it breaks the cycle
   with no DDL impact (the FK lives on the owning side, `notes.memo_id`).

Plus one latent **security bug** the scan surfaced (it is not separable from item 2 —
`update-note-timestamp` is the file being re-layered anyway):

7. **`PATCH /notes/:id/timestamp` has no ownership check.**
   `UpdateNoteTimestampAction.apply(@Param('id') id, @GetAuthUser() _user)` — the
   authenticated user is accepted and **ignored**; the repository method
   `updateNoteTimestamp(id)` updates by id alone. Any authenticated user can touch any
   note's `updated_at`. It also throws bare `new Error('Note not found')` (→ HTTP 500) and
   returns TypeORM's `UpdateResult` in the response body (infra type leaking to the wire).

## Current state (verified by reading the code, 2026-09-18)

### Endpoints touched (9 of 15) — routes, methods, request bodies unchanged

| Endpoint | Today's injection | Violation |
|---|---|---|
| `POST /notes` (CreateNoteAction) | `CreateNoteTransactionScript` | Action → TS |
| `PATCH /notes/:id/folder` (MoveNoteToFolderAction) | `MoveNoteToFolderTransactionScript` | Action → TS |
| `PATCH /notes/reorder` (ReorderNotesAction) | `ReorderNotesTransactionScript` | Action → TS |
| `PATCH /notes/title/:id` (UpdateNoteTitleAction) | `UpdateNoteTitleTransactionScript` | Action → TS |
| `GET /notes/names` (GetNoteNamesByUserIdAction) | `NoteMemoTagRepository` + cursor math in the action | Action → Repository |
| `GET /notes/explorer-names` (GetNoteNamesForExplorerAction) | `NoteMemoTagRepository` | Action → Repository |
| `GET /notes/:id/versions` (GetNoteVersionsAction) | `NoteVersionRepository` + responder | Action → Repository |
| `POST /notes/:noteId/versions/:versionId/load` (LoadNoteVersionAction) | `NoteVersionRepository` **and** `NoteService` + 404 in the action | Action → Repository (mixed) |
| `PATCH /notes/:id/timestamp` (UpdateNoteTimestampAction) | `NoteMemoTagRepository` | Action → Repository + IDOR + 500 |

Untouched by this spec: `GET /notes/:id`, `PATCH /notes/:id/detail`, `DELETE /notes/:id`
(action is already service-routed; only the service's internals change), `PATCH /notes/:id/archive`,
`POST /notes/:id/convert-to-memo`, `GET /notes/search` — all already follow
Action → `NoteService` → TS.

### The service today

`NoteService` (`domain/services/note.service.ts`) injects 5 TSs + `EventEmitter2` +
`NoteMemoTagRepository` + `CheckItemsAggregator`. Its repo usage is confined to
`deleteNote` (lines 114–129):

```
deleteNote(noteId, userId)
  -> noteRepository.findById(noteId, userId)          <- 404 if missing
  -> eventEmitter.emitAsync(DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND, { noteId, userId })
  -> eventEmitter.emitAsync(DELETE_CHECK_ITEMS_BY_NOTE_COMMAND, { noteId, userId })
  -> noteRepository.deleteNoteById(noteId, userId)
```

Per `AGENTS.md` §3.2 the injection matrix *does* allow Domain Services → Repos, so this is
the softest flag Metatron raised. It is still in scope because (a) it is a **write** use
case, and the house precedent (users-register spec, "write transactions inside a domain
service … writes belong in Transaction Scripts") puts writes in TSs, and (b) removing it
is what lets `NoteMemoTagRepository` leave the service's constructor entirely.

### Deviations that get NO code change here (recorded, with rationale)

- **"app/ and apps/ used interchangeably"** — `notes/` uses `apps/`, which is exactly what
  both `AGENTS.md` files document (`apps/actions/`, `apps/dtos/`). The deviants are the
  *other* modules: `auth/app`, `folders/app`, `users/app`, `tags/app` (and `tags/apps`
  exists alongside — that module has both). Migrating them is a cross-module rename with
  zero notes-module value; recorded as follow-up F2.
- **"7 files unreachable from any route or module"** — **not reproducible.** An import-graph
  BFS from `notes.module.ts` (all providers/controllers) over `backend/src` with `src/...`
  alias resolution finds **all 67 non-spec source files reachable**; the same holds from
  controllers+listeners only, and on the older `~/app/chronus-react-nestjs` checkout.
  Note the report's "76 files" matches the *stale* `~/app/chronus-react-nestjs` clone's
  notes file count (77 in the active clone). The one file that *is* dead is the
  check-items DTO duplicate (item 5 above) — it is deleted regardless.
- **"15 high-risk files have no test"** — behavioral work, not structural; deliberately a
  separate spec (follow-up F1). The *new* code in this spec gets specs per the 80% rule.

### Transaction-script layout (context for D7)

`domain/transaction-scripts/` is internally inconsistent: **7 flat files**
(`create-note`, `get-note-by-id`, `get-note-names-by-ids`, `search-notes`,
`update-note-title`, `move-note-to-folder`, `reorder-notes` — the last two with the
wrong suffix) vs **3 subfolders** (`archive-note/`, `update-note-TS/`,
`convert-checklist-to-memo-TS/`). The root `AGENTS.md` shows `{ts-name}-ts/` subfolders;
the module `AGENTS.md` shows `{ts-name}-TS/`. The code majority is flat.

## Scope

**IN:**

1. New `NoteService` pass-through/orchestration methods for the 9 deviating endpoints;
   all 9 actions re-pointed at `NoteService` (their only domain-layer dependency).
2. Six new Transaction Scripts:
   `GetNoteNamesByUserId`, `GetNoteNamesForExplorer`, `GetNoteVersions`,
   `LoadNoteVersion`, `UpdateNoteTimestamp`, `DeleteNote`.
3. Two command types at the app→domain boundary for the two TSs that currently take
   application DTOs: `CreateNoteCommand`, `UpdateNoteTitleCommand`
   (users-register spec precedent: "domain layer never imports the request DTO").
4. `update-note-timestamp`: ownership check (404 for non-owners), `UpdateResult` →
   **204 No Content**, bare `Error` → `NotFoundException`.
5. Rename the two `.transaction-script.ts` files to `.transaction.script.ts` (+ importers).
6. Delete dead `apps/dtos/responses/check-item.response.dto.ts`.
7. Delete the unused `Memo.note` back-reference (breaks the flagged circular import).
8. `notes.module.ts` provider registrations; `notes/AGENTS.md` list updates.
9. House-style Jest specs for the six new TSs + a new `note.service.spec.ts`
   (the service is one of the 15 untested files; its two newly interesting methods —
   `deleteNote` ordering and `loadNoteVersion` orchestration — are exactly what a bug
   could break).

**OUT (explicit):**

- No route, method, or request-body changes on any endpoint.
- No wire-format change except `PATCH /notes/:id/timestamp` response body
  (`UpdateResult` JSON → empty 204). **Frontend-safe:** all five frontend call sites
  (`notes.requests.ts:10`, `useNoteQueries.ts:20`, `DesktopNoteListView.tsx:104`,
  `MobileNoteListVIew.tsx:75`, `NoteItem.tsx:138`, `MobileTagNotesListView.tsx:64`)
  either type it `Promise<void>` or ignore the body — verified by grep.
- No DB schema changes, no migrations.
- No changes to the already-compliant 6 endpoints, to `NoteAggregator`, or to any other module.
- No flat↔subfolder layout moves for existing TSs (see D7).
- No `create-note` response DTO (entity still returned — follow-up F4).

## Proposed changes

### New files

**N1. `domain/transaction-scripts/create-note.command.ts`**

```typescript
export type CreateNoteCommand = {
  name: string;
  userId: number;
  isMemo?: boolean;
  folderId?: number | null;
};
```

Replaces `CreateNoteDto & { userId: number }` as the TS input (the `&`-hack goes away;
the action builds the command).

**N2. `domain/transaction-scripts/update-note-title.command.ts`**

```typescript
export type UpdateNoteTitleCommand = {
  name: string;
};
```

Replaces `UpdateNoteTitleDto` in the TS signature (the domain no longer imports an app DTO).

**N3. `domain/transaction-scripts/get-note-names-by-user-id.transaction.script.ts`**

`GetNoteNamesByUserIdTransactionScript`, injects `NoteMemoTagRepository`.
`apply(params: { userId, cursor, limit, query?, type?, tagId? }):
Promise<{ notes: NoteNameRow[]; hasMore: boolean; nextCursor: number }>`.

Moves the pagination semantics out of the action and into the TS (house rule: "TS own
use-case logic"): `notes` from `noteRepository.getNoteNamesByUserId(...)`,
`hasMore = notes.length === limit`, `nextCursor = cursor + limit + 1`
(identical arithmetic to today's action, lines 40–42).

**N4. `domain/transaction-scripts/get-note-names-for-explorer.transaction.script.ts`**

`GetNoteNamesForExplorerTransactionScript`, injects `NoteMemoTagRepository`.
`apply(userId: number, folderId?: string)` → delegates to
`noteRepository.getNoteNamesForExplorer(userId, folderId)`. Thin by design — the module
already has this shape (`GetNoteNamesByIdsTransactionScript`).

**N5. `domain/transaction-scripts/get-note-versions.transaction.script.ts`**

`GetNoteVersionsTransactionScript`, injects `NoteVersionRepository`.
`apply(noteId: number, userId: number)` → `noteVersionRepository.findByNoteId(noteId, userId)`.

**N6. `domain/transaction-scripts/load-note-version.transaction.script.ts`**

`LoadNoteVersionTransactionScript`, injects `NoteVersionRepository`.
`apply(noteId: number, versionId: number, userId: number): Promise<NoteVersion>`:
`noteVersionRepository.findById(versionId, noteId, userId)` →
`if (!version) throw new NotFoundException('Version not found')`.
The 404 logic moves from the action (today's lines 30–37) into the TS.

**N7. `domain/transaction-scripts/update-note-timestamp.transaction.script.ts`**

`UpdateNoteTimestampTransactionScript`, injects `NoteMemoTagRepository`.
`apply(id: number, userId: number): Promise<void>`:
`const result = await noteRepository.updateNoteTimestamp(id, userId);`
`if (result.affected === 0) throw new NotFoundException('Note not found');`
The ownership check arrives via the repository signature change (M7).

**N8. `domain/transaction-scripts/delete-note.transaction.script.ts`**

`DeleteNoteTransactionScript`, injects `NoteMemoTagRepository`.
`apply(noteId: number, userId: number): Promise<void>` →
`noteRepository.deleteNoteById(noteId, userId)`. Thin write TS so the service no longer
touches the repository (see D4 for why event emission stays in the service).

### Modified files

**M1. `apps/actions/notes/create-note-action/create-note.action.ts`**

- Inject `NoteService` instead of `CreateNoteTransactionScript`.
- Build `const command: CreateNoteCommand = { name: dto.name, isMemo: dto.isMemo, folderId: dto.folderId, userId }`
  and `return this.noteService.createNote(command)`.
- Route, swagger, decorators, return type (`Promise<Note>`) unchanged.

**M2. `apps/actions/notes/move-note-to-folder-action/move-note-to-folder.action.ts`**

- Inject `NoteService`; `const note = await this.noteService.moveNoteToFolder(id, userId, dto.folderId)`;
  response build (`{ id: note.id, folderId: note.folderId }`) unchanged.
- Import of the renamed TS disappears (M9).

**M3. `apps/actions/notes/reorder-notes-action/reorder-notes.action.ts`**

- Inject `NoteService`; call `this.noteService.reorderNotes({ userId, items: dto.items, folderId })`
  with the existing `folderId` normalization (`dto.folderId === undefined ? null : (dto.folderId ?? null)`)
  kept in the action, unchanged.

**M4. `apps/actions/notes/update-note-title-action/update-note-title.action.ts`**

- Inject `NoteService`; build `UpdateNoteTitleCommand { name: updateNoteTitleDto.name }`;
  `return this.noteService.updateNoteTitle({ id: parseInt(id, 10), name: command.name, userId: authUser.userId })`
  — signature detail in D6. Stale JSDoc ("@returns … NoteResponseDto") fixed to match the
  actual `{ id, name }` return.

**M5. `apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action.ts`**

- Inject `NoteService` instead of `NoteMemoTagRepository`; body becomes
  `return this.noteService.getNoteNamesByUserId({ userId, cursor, limit, query, type, tagId });`
- The local `GetNoteNamesResponse` type stays (wire shape identical); the cursor math
  (lines 40–42) is deleted from the action — it lives in the TS (N3).

**M6. `apps/actions/notes/get-note-names-for-explorer-action/get-note-names-for-explorer.action.ts`**

- Inject `NoteService`; `return this.noteService.getNoteNamesForExplorer(userId, folderId);`

**M7. `infra/repositories/note-memo-tag.repository.ts`**

- `updateNoteTimestamp(id: number, userId: number)`: add
  `.andWhere('note.user_id = :userId', { userId })`; **delete**
  `if (result.affected === 0) throw new Error('Note not found')` (the TS maps
  `affected === 0` → 404; repositories stay data-only).

**M8. `apps/actions/notes/get-note-versions-action/get-note-versions.action.ts`**

- Inject `NoteService` (+ keep the responder);
  `const versions = await this.noteService.getNoteVersions(noteId, authUser.userId);`
  `return this.responder.apply(versions);` — response shape unchanged.

**M9. Rename (git mv) + importer updates**

- `domain/transaction-scripts/move-note-to-folder.transaction-script.ts` →
  `move-note-to-folder.transaction.script.ts`
- `domain/transaction-scripts/reorder-notes.transaction-script.ts` →
  `reorder-notes.transaction.script.ts`
- Importers updated: the two actions (already being edited, M2/M3) and `notes.module.ts`.

**M10. `apps/actions/notes/load-note-version-action/load-note-version.action.ts`**

- Drop `NoteVersionRepository` injection (keep `NoteService` + responder).
- `const noteWithCheckItems = await this.noteService.loadNoteVersion(nid, vid, authUser.userId);`
  `return this.responder.apply(noteWithCheckItems);`
- The 404 now comes from `LoadNoteVersionTransactionScript` (N6); the inline
  `version.description` read moves into the service (M11).

**M11. `domain/services/note.service.ts`** — the heart of the spec.

Constructor: **remove `NoteMemoTagRepository`**; add the six new TSs. It now injects
11 TSs + `EventEmitter2` + `CheckItemsAggregator` and **zero repositories**.

New/changed methods:

```typescript
async createNote(command: CreateNoteCommand): Promise<Note> {
  return this.createNoteTransactionScript.apply(command);
}

async moveNoteToFolder(noteId: number, userId: number, folderId: number | null): Promise<Note> {
  return this.moveNoteToFolderTransactionScript.apply(noteId, userId, folderId);
}

async reorderNotes(input: ReorderNotesInput): Promise<void> {
  return this.reorderNotesTransactionScript.apply(input);
}

async updateNoteTitle(id: number, name: string, userId: number): Promise<{ id: number; name: string }> {
  return this.updateNoteTitleTransactionScript.apply(id, { name }, userId);
}
// (updateNoteTitle keeps the existing positional TS signature internally — see D6)

async getNoteNamesByUserId(params: {
  userId: number; cursor: number; limit: number;
  query?: string; type?: 'memo' | 'checklist'; tagId?: string;
}): Promise<{ notes: NoteNameRow[]; hasMore: boolean; nextCursor: number }> {
  return this.getNoteNamesByUserIdTransactionScript.apply(params);
}

async getNoteNamesForExplorer(userId: number, folderId?: string) {
  return this.getNoteNamesForExplorerTransactionScript.apply(userId, folderId);
}

async getNoteVersions(noteId: number, userId: number) {
  return this.getNoteVersionsTransactionScript.apply(noteId, userId);
}

async loadNoteVersion(noteId: number, versionId: number, userId: number): Promise<NoteWithCheckItems> {
  const version = await this.loadNoteVersionTransactionScript.apply(noteId, versionId, userId);
  return this.updateNoteWithCheckItems(
    noteId,
    { description: version.description, skipVersionCapture: true },
    userId
  );
}

async updateNoteTimestamp(id: number, userId: number): Promise<void> {
  return this.updateNoteTimestampTransactionScript.apply(id, userId);
}

async deleteNote(noteId: number, userId: number): Promise<void> {
  await this.getNoteByIdTransactionScript.apply(noteId, userId);   // 404 if missing/not owned
  await this.eventEmitter.emitAsync(DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND, { noteId, userId });
  await this.eventEmitter.emitAsync(DELETE_CHECK_ITEMS_BY_NOTE_COMMAND, { noteId, userId });
  await this.deleteNoteTransactionScript.apply(noteId, userId);
}
```

`loadNoteVersion` is the one true orchestration (TS read → existing
`updateNoteWithCheckItems` with `skipVersionCapture`) — a domain service doing exactly
what `AGENTS.md` says a domain service is for. `deleteNote` keeps today's **exact
operation order** (find → tag event → check-item event → delete); the only change is
that find and delete go through TSs. Order is load-bearing — see Edge cases.

Everything else in the service (`archiveNote`, `convertChecklistToMemo`,
`getNoteByIdWithCheckItems`, `updateNoteWithCheckItems`, `search`) is untouched.

**M12. `domain/entities/notes/memo.entity.ts`**

- Delete the `note: Note` property, its `@OneToOne(() => Note, ...)` decorator, the
  `OneToOne` import, and `import { Note } from './note.entity'`.
- `note.entity.ts` (owning side: `@OneToOne(() => Memo, ...) + @JoinColumn({ name: 'memo_id' })`,
  `cascade: true`, `onDelete: 'SET NULL'`) is **untouched**. The FK `notes.memo_id` is
  defined by the owning side, so removing the inverse property changes no DDL.

**M13. `apps/actions/update-note-timestamp.action.ts`**

- Inject `NoteService`; add `@HttpCode(204)`; signature becomes
  `async apply(@Param('id', ParseIntPipe) id: number, @GetAuthUser('userId') userId: number): Promise<void>`
  and `return this.noteService.updateNoteTimestamp(id, userId);`
- Delete `import { UpdateResult } from 'typeorm'` and the `//@TODO: Add valiodation here`
  comment (the check now exists in N7).

**M14. `notes.module.ts`**

- `providers`: add the six new TSs (`GetNoteNamesByUserIdTransactionScript`,
  `GetNoteNamesForExplorerTransactionScript`, `GetNoteVersionsTransactionScript`,
  `LoadNoteVersionTransactionScript`, `UpdateNoteTimestampTransactionScript`,
  `DeleteNoteTransactionScript`).
- Fix the two renamed-TS imports (M9).
- `imports`, `controllers`, `exports`: unchanged. (`NoteMemoTagRepository` stays
  exported — other modules consume `NotesModule`; narrowing exports is out of scope.)

**M15. `notes/AGENTS.md`**

- Transaction Scripts list: add the six new TSs.
- Services section: note that `NoteService` now fronts all 15 endpoints.

**D16. Delete `apps/dtos/responses/check-item.response.dto.ts`** — dead duplicate of
`check-items/apps/dtos/responses/check-item.response.dto.ts`; zero importers (verified).
The `//@TODO` comment inside it dies with the file.

### New test files (house style)

House style (per `backend/AGENTS.md` §3.9 and existing specs): SUT named `target`,
`__specs__/` adjacent to the subject, inline `useValue` mocks,
`// Arrange / Act / Assert`, `generateRandomNumbers` from `src/shared-kernel/test-utils`.

Flat TSs take their specs under `domain/transaction-scripts/__specs__/` (matches
`update-note-title.transaction.script.spec.ts` and
`get-note-names-by-ids.transaction.script.spec.ts`, which sit there today).

- **T1. `get-note-names-by-user-id.transaction.script.spec.ts`** — the pagination
  semantics (the only real logic in N3):
  - rows.length === limit → `hasMore: true`, `nextCursor = cursor + limit + 1`
  - rows.length < limit → `hasMore: false`, same `nextCursor`
  - `query`/`type`/`tagId` forwarded to the repository
- **T2. `get-note-names-for-explorer.transaction.script.spec.ts`** — one case: args
  (including `folderId`) forwarded, result passed through.
- **T3. `get-note-versions.transaction.script.spec.ts`** — one case: `(noteId, userId)`
  forwarded to `findByNoteId`, result passed through.
- **T4. `load-note-version.transaction.script.spec.ts`** —
  - repository returns a version → returned to the caller
  - repository returns `null` (missing **or** another user's version) → `NotFoundException`
- **T5. `update-note-timestamp.transaction.script.spec.ts`** —
  - `affected > 0` → resolves `undefined`
  - `affected === 0` (not owner's note) → `NotFoundException`
- **T6. `delete-note.transaction.script.spec.ts`** — `deleteNoteById` called with
  `(noteId, userId)`.
- **T7. `domain/services/__specs__/note.service.spec.ts`** (new — service has no spec
  today) — only the two methods with real orchestration, plus one pass-through each as
  regression anchors:
  - `deleteNote`: all four steps called **in order** (get-note-by-id →
    `DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND` → `DELETE_CHECK_ITEMS_BY_NOTE_COMMAND` →
    delete TS); get-note-by-id rejection (404) → events and delete **never** fire
  - `loadNoteVersion`: version's `description` forwarded to
    `updateNoteWithCheckItems` with `skipVersionCapture: true`; TS 404 propagates
  - `createNote` / `moveNoteToFolder`: argument pass-through (one case each)
  Mocks: all 11 TSs + `EventEmitter2` + `CheckItemsAggregator` as inline `useValue`s.

## Decisions (locked, with rationale)

- **D1. Pass-through service methods, not new orchestration**, for the eight simple
  cases. The service's job is to be the single entry point actions may use; wrapping a
  single TS call is the minimal honest shape. Only `loadNoteVersion` and `deleteNote`
  gain real orchestration.
- **D2. Thin read TSs are idiomatic here, not over-engineering.** The module already
  ships `GetNoteNamesByIdsTransactionScript` and `GetNoteByIdTransactionScript` as
  near-pure repository pass-throughs; N4/N5 follow that established shape.
- **D3. `loadNoteVersion`: the service orchestrates, the 404 lives in the TS.** A TS
  may not inject another TS (AGENTS.md §3.2: "Cannot inject … other TS"), so
  `LoadNoteVersionTransactionScript` cannot call `UpdateNoteTransactionScript`; the
  service composes the read TS with the existing `updateNoteWithCheckItems` — the
  documented domain-service role.
- **D4. Event emission stays in `NoteService.deleteNote`.** Every `EventEmitter2` use in
  the repo is service-layer (`check-item.service.ts:38`, `time-track.service.ts:111`,
  `note.service.ts:118`); no TS emits events anywhere. Putting emission in
  `DeleteNoteTransactionScript` would be the first of its kind; a thin delete TS keeps
  the precedent intact and still removes the repository from the service.
- **D5. The timestamp IDOR fix ships with the re-layering.** The ownership check is a
  precondition of the endpoint being correct at any layer; the 204/404 response change
  is wire-safe (all five frontend call sites ignore the body — verified). The
  `UpdateResult`→204 and `Error`→404 changes are the same lines.
- **D6. Commands only where a DTO currently crosses into the domain** (create-note,
  update-note-title). The other TSs already take primitives. `UpdateNoteTitleTransactionScript.apply`
  keeps its existing `(id, dto, userId)` *shape* internally but its `dto` parameter
  becomes `UpdateNoteTitleCommand` (structurally `{ name }`) — the existing
  `update-note-title.transaction.script.spec.ts` needs a one-line type update at most,
  no logic change.
- **D7. Suffix rename only; no layout moves.** 7 of 10 TSs are flat files; moving the
  three subfolder TSs (or all ten) would churn ~15 import sites for zero behavioral
  value. The documented layout (root `AGENTS.md` says subfolder) is drift — follow-up F3.
  New TSs in this spec are flat, matching the module majority.
- **D8. Break the cycle by deleting the unused back-reference**, not by restructuring
  the relation. Grep shows zero reads of `memo.note` anywhere in `src/`; the owning-side
  relation is untouched, so no DDL, no migration. (The cycle is currently *harmless* —
  both sides use `() => Note`/`() => Memo` thunks, which TypeORM resolves after module
  load — but an unused property is the cheapest way to make the flag go away.)
- **D9. `notes/` keeps `apps/`.** It matches both AGENTS.md files; the singular-`app/`
  modules are the deviants (follow-up F2).

## Open questions

**OQ1. `POST /notes` returns the raw `Note` entity** (with `memo`, `archivedAt`, …).
Should the create response move to a response DTO? _Default: No — wire-identical
today, and it would change the response shape; record as follow-up F4._

**OQ2. Should `GET /notes/names` grow a response DTO** (today an inline
`type GetNoteNamesResponse` in the action)? _Default: No — keep the inline type; the
spec's goal is layering, not DTO-ization._

**OQ3. Narrow `NotesModule.exports`** (`NoteMemoTagRepository` is exported; verify who
actually injects it cross-module)? _Default: No — separate concern, no behavior at stake._

## Edge cases

- **Timestamp IDOR:** today `PATCH /notes/9999/timestamp` with *any* authenticated token
  succeeds if note 9999 exists. After: non-owner → 404. Frontend flows (note
  "move-to-top" on view) always operate on the viewer's own notes — no behavior change
  for legitimate use.
- **Timestamp response:** `UpdateResult` JSON (`{ affected, raw }`) → empty 204.
  Frontend ignores the body everywhere (verified); any unknown external consumer
  parsing `affected` would break — no such consumer exists in-repo.
- **`deleteNote` ordering preserved:** find → tag-association event → check-item event
  → delete. Deleting first would let the `tag_note`/check-item rows be removed by FK
  cascade instead of the listeners (or orphaned, if no FK exists) — the listeners are
  the mechanism, so the order must survive.
- **`loadNoteVersion` on a non-memo note:** `version.description` is whatever was
  captured historically (may be `''`); `updateNoteWithCheckItems` handles a plain
  `description` on a checklist note exactly as today's action did — same code path.
- **`Memo` back-reference removal:** no DDL (owning-side `notes.memo_id` FK, `SET NULL`,
  `cascade: true` all live on `Note`). Confirmed by app boot + the existing test suite
  against the test database (Verification, step 1).
- **Renamed TS files:** git mv + 3 importer updates; no runtime impact (Nest resolves
  providers by class, not path).
- **No migrations generated or run.**

## Verification (repo gates)

From `backend/`:

1. `npm run test` — T1–T7 green + existing suite green (this also exercises TypeORM
   metadata against the test DB, covering the `Memo` back-reference removal).
2. `npm run test:architecture` — depcruise; the deleted domain→app DTO imports
   (create-note, update-note-title) and the entity cycle must not produce new violations.
3. `npm run test:fitness` — naming/layer fitness checks.
4. `npm run lint:check` and `npm run format:check`.
5. `npm run build`.

Manual smoke (optional, against a running stack):

- `POST /notes` → 201, identical JSON to before.
- `PATCH /notes/:id/folder`, `PATCH /notes/reorder`, `PATCH /notes/title/:id` → unchanged.
- `GET /notes/names?cursor=0&limit=20` → identical `{ notes, hasMore, nextCursor }`.
- `PATCH /notes/:id/timestamp` with the owner's token → **204 empty**; with a second
  user's token → **404** (was 200 + `UpdateResult` before).
- `POST /notes/:noteId/versions/:versionId/load` with someone else's version → 404.
- `DELETE /notes/:id` → tag associations and check items still cleaned up (listeners fire).

## Follow-ups (explicitly out of scope, recorded for the next spec)

1. **F1 — Test-coverage spec** for the untested high-risk files the report named.
   **Done (2026-09-18):** `specs/notes-module-test-coverage.md` — specs for
   `note.aggregator.ts` and the data-operation half of
   `note-memo-tag.repository.ts`; the remaining files ruled out or blocked on the
   (now-built) integration-test infra — see `specs/notes-module-test-coverage.md`.
2. **F2 — Cross-module `app/` → `apps/` rename** (`auth/app`, `folders/app`, `users/app`,
   `tags/app` + its stray `tags/apps` twin).
   **Done (2026-09-18, branch `apps-rename`):** one commit per module
   (auth, users, folders, tags-merge); folders and tags also co-located
   action-level DTO/swagger files the rename would have newly flagged under
   the DTO-structure fitness check (which only scans `src/*/apps`).
3. **F3 — TS layout unification + docs:** decide flat vs `{ts-name}-TS/` subfolder, move
   the minority, and reconcile root `AGENTS.md` (`{ts-name}-ts/`) with the module
   `AGENTS.md` (`{ts-name}-TS/`) against the code.
4. **F4 — `CreateNoteAction` response DTO** (raw `Note` entity → response DTO; wire change).
5. **F5 — Metatron report discrepancy:** "7 unreachable" not reproducible on either
   checkout (all 67 notes source files reachable from `notes.module.ts` wiring); report's
   "76 files" matches the stale `~/app/chronus-react-nestjs` clone, not the active one.
   Worth a look at how Metatron computes reachability before trusting that flag again.

## Implementation notes (post-hoc)

- T7 (`note.service.spec.ts`) covers `deleteNote` (ordering + 404 short-circuit)
  and `loadNoteVersion` (restore + 404 propagation). The draft's optional
  `createNote`/`moveNoteToFolder` pass-through anchors were dropped: one-line
  forwarding assertions test wiring, not behavior.
- T1's pagination semantics and T4/T5's 404 paths are the behavioral cores;
  the remaining new-TS specs are single forwarding cases, matching the
  module's existing thin-TS spec precedent.
- Final gates (2026-09-18): `npm run test` 36 suites / 161 tests green;
  `depcruise` clean (342 modules, 968 dependencies); `test:fitness` clean for
  notes (2 pre-existing DTO-structure violations in `time-tracks/`, untouched
  by this work); eslint/prettier clean on all touched files; `build` green.
- The `GET /notes/names` shapes (`NoteNameRow`, `GetNoteNamesQuery`,
  `GetNoteNamesResult`) live in `note-name-row.projection.ts` under
  `domain/transaction-scripts/` — the depcruise rule forbids TS→TS imports
  even at the type level, so the shared output shape moved to a projection
  file (house-approved suffix) rather than one TS importing another's types.
