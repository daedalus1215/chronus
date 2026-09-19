# Spec — notes module: test coverage for untested high-risk files (F1)

**Status:** Implemented (2026-09-18)
**Implementation repo:** `~/Projects/chronus-frontend-backend` (backend only)
**Source:** Metatron report item "15 high-risk files have no test"; follow-up F1 of
`specs/notes-module-layer-compliance.md`

## Scope decision — which files earn a spec

The report named 6 notes-module files. Per the house test bar (a test must defend an
observable contract and fail on a plausible bug; wiring/shape assertions are padding):

|File|Verdict|Reason|
|---|---|---|
|`domain/aggregators/note.aggregator.ts`|**Spec written**|Real behavior: 404/403 semantics, memo lifecycle (create/replace/archive), missing-id skipping. Consumed by 4 other modules via `NoteWriterPort` + `NoteAggregator` export.|
|`infra/repositories/note-memo-tag.repository.ts`|**Spec written (targeted)**|Only the data-operation logic earns unit coverage: `save()` must persist the memo **before** the note (FK ordering) and `deleteNoteById` must stay scoped by `user_id` (IDOR regression guard). The query-builder methods (`findById`, `getNoteNames*`, searches) are DB behavior — a mock test would assert TypeORM call chains, i.e. implementation. Precedent: `note-audio.repository.spec.ts` tests exactly this class of method.|
|`domain/services/note.service.ts`|Already covered|`note.service.spec.ts` landed with the layer-compliance work (deleteNote ordering, loadNoteVersion). Remaining methods are one-line pass-throughs.|
|`apps/dtos/responses/note.response.dto.ts`|No spec|Pure shape declaration, zero logic. The entity→DTO mapping lives in the responders, which are already specced.|
|`domain/entities/notes/note.entity.ts`|No spec|Plain column-decorated class; no hooks, virtuals, or logic. DDL drift is covered by the suite running TypeORM metadata against the test DB.|
|`notes.module.ts`|No spec|Wiring. A boot test needs a live TypeORM data source — see the integration gap below.|

## New files

- `domain/aggregators/__specs__/note.aggregator.spec.ts` — 14 tests:
  `exists` (missing/found), `isArchived` (archived/not/missing→treated-as-archived,
  the current semantics), `getReference` (404, 403, projection),
  `createNoteWithMemo` (memo attached with description / absent without),
  `replaceDescription` (404, replace-in-place on existing memo, attach-new-memo),
  `archiveNotes` (archives found notes, skips missing ids).
- `infra/repositories/__specs__/note-memo-tag.repository.spec.ts` — 3 tests:
  `save` memo-before-note ordering + saved-memo attachment + no-memo path,
  `deleteNoteById` scoped `{ id, userId }` delete.

House style throughout: SUT `target`, `__specs__/` adjacent, `createMock` +
`useValue` providers, `generateRandomNumbers`, Arrange/Act/Assert.

## The integration gap (next step, not done here)

The query-builder half of the repository — user scoping in `findById`, the
`updateNoteTimestamp` `user_id` predicate (the IDOR fix), LIKE/tag-join/pagination in
`getNoteNamesByUserId`, explorer ordering — is only defensible against a real database.
The scaffolding exists but has never been used: `test/jest-integration.json`
(testRegex `*.integration.spec.ts`, excluded from `npm run test`),
`Dockerfile.test`, and a stale `docker-compose.test.yml` (SQLite-era
`file:/app/data/test.db`; the app is Postgres now). Zero integration specs exist and
there is no shared DataSource bootstrap helper.

A follow-up would need to decide: test Postgres via compose (replace the stale yml) vs
testcontainers; `synchronize: true` vs running the real migration chain in the test DB.
Until then the repository's SQL-level contracts rest on manual testing.

## Verification

- `npm run test`: 38 suites / 178 tests green (17 new).
- `npm run depcruise`: no violations.
- eslint + prettier clean on the new specs; `npm run build` green.
