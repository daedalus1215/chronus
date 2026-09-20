# Spec — Metatron sweep: remaining modules (folders, tags, time-tracks, notes leftover, users)

**Status:** Ready for implementation (folders context fully verified; tags/time-tracks/users verified at outline level, detailed at phase start)
**Implementation repo:** this repo (`chronus-frontend-backend`), `backend/`
**Date:** 2026-09-19
**Source:** metatron scan of 2026-09-19 (383 files, 15 modules, coverage 381/383). Every finding below is from that scan, and every context claim below was verified by reading the file it names.

## Goal

Clear the actionable metatron deviations in the modules that the original notes-module sweep never touched. Same arc as the notes work: per-phase report → fix → gate suite → metatron re-scan.

## Context (verified by reading the code, not assumed)

**The documented hierarchy** (`backend/docs/patterns/dependency-hierarchy.md`):
`Actions → Domain Services → Transaction Scripts → … → Repositories`. Actions point at Domain Services; TS files own use-case logic; services orchestrate TSes. The strict rules (no same-level injection, blackbox, inward dependencies) are enforced by dependency-cruiser; the Action→Service→TS flow is the canonical shape every other module follows.

**Precedent:** the notes module had the identical `action>transaction-script` flags. They were fixed by routing actions through `NoteService` (the notes arc, F1/F2). Five of seven domain modules have a domain service; folders is the only one without.

**Module states (2026-09-19):**

- **folders** — 6 actions, 6 TS, 1 repository, 1 entity, 1 port, no service, no responder.
  - All 6 TS files are flat in `domain/transaction-scripts/` with the hyphen suffix
    (`create-folder.transaction-script.ts`) — violates both the canonical file suffix
    (`.transaction.script.ts`) and the per-TS subfolder layout
    (`{ts-name}-TS/`) that F3 established and documented.
  - All 6 actions inject their TS directly and map results to `FolderResponseDto` inline.
  - The 6 TS are referenced only by their action and `folders.module.ts` (no cross-module imports).
  - Four of the six action directories still contain a dead flat shim
    (`create-folder.action.ts` = one-line re-export); those shims are deleted by the
    separate `f5-dead-file-cleanup` branch and are out of scope here.
- **tags** — has `TagService` and the correct TS layout. 4 actions bypass the service
  (`create-tag`, `delete-tag`, `remove-tag-from-note`, `update-tag`); `get-tag-by-id`
  reaches the repository directly **and there is no get-tag-by-id TS** — that use case
  was never given a script.
- **time-tracks** — has `TimeTrackService` and the correct layout; only
  `delete-time-track` bypasses it.
- **notes (leftover)** — `get-note-names-by-userId` action reaches its TS directly
  (created during the notes arc before the service-routing convention settled).
- **users** — `users.service.ts` injects `user.repository.ts` directly while the module
  also has TSes that use the repository. Needs a read of the service at phase start to
  decide: route through a read TS, or document the service→repository read as accepted
  (check the AGENTS.md dependency table first — it may already allow it).

## Phases

### Phase 1 — folders (branch: `metatron-remaining-modules`)

**1a. TS layout** — for each of the 6 TS:
`git mv {ts-name}.transaction-script.ts {ts-name}-TS/{ts-name}.transaction.script.ts`
then update the 2 importers per file (its action, `folders.module.ts`). Pure move +
suffix change; no logic touched. One commit.

**1b. FolderService** — create `folders/domain/services/folder.service.ts`
(`@Injectable()`, injects the 6 TSes, one delegating method per TS with identical
signatures — the `NoteService` shape). Re-point the 6 actions from TS to service;
actions keep their inline `FolderResponseDto` mapping (no responder exists in this
module; mapping location is not a flagged deviation). Register the service in
`folders.module.ts`. One commit.

**Verify:** full gate suite (unit, integration, dependency-cruiser, fitness, build) +
metatron re-scan shows no folders findings.

### Phase 2 — tags, time-tracks, notes leftover, users

- **tags:** route `delete-tag`, `remove-tag-from-note`, `update-tag` through
  `TagService` (add delegating methods). `create-tag` turned out to be dead code:
  `CreateTagAction` was never registered in `tags.module.ts` (zero occurrences in the
  module's git history), nothing on the frontend calls `POST /tags`, and tag creation
  is already covered by `add-tag-to-note`'s find-or-create-by-name — deleted the
  action, its TS (+ spec), DTO, and swagger file. `get-tag-by-id` previously reached
  the repository directly and had no TS: create
  `get-tag-by-id-TS/get-tag-by-id.transaction.script.ts` (loads by id + userId,
  404 if absent), route the action through `TagService`.
- **time-tracks:** route `delete-time-track` through `TimeTrackService`.
- **notes:** route `get-note-names-by-userId` through `NoteService` (add method if
  absent).
- **users:** read `users.service.ts`; if the direct repository use is a read path with
  no TS equivalent, either add a small read TS or record the exception in
  `AGENTS.md` — decide against the dependency table, document whichever way it goes.

**Verify:** gate suite + metatron re-scan shows no `action>transaction-script`,
`action>repository`, or `service>repository` findings anywhere.

### Phase 3 — the 15 untested-risk files

Triaged with the notes-F1 bar: a test earns its place only where a plausible bug would
fail it (entity shape/defaults, service orchestration, repository query correctness).
Pure wiring (module files, logic-less decorators/DTOs) is reported as intentionally
untested rather than padded with tests that assert plumbing.

Files (from the 2026-09-19 scan):
- notes: `note.entity.ts`, `memo.entity.ts`, `note.response.dto.ts`, `notes.module.ts`
- check-items: `check-item.entity.ts`, `check-item.service.ts`, `check-items.repository.ts`
- time-tracks: `time-track.entity.ts`, `time-track.service.ts`, `time-track.repository.ts`
- tags: `tag.entity.ts`, `tag.repository.ts`
- audio: `audio.service.ts`
- shared-kernel: `protected-action.decorator.ts`, `get-auth-user.decorator.ts`

**Verify:** gate suite + metatron re-scan; untested-risk list reduced to the
intentionally-untested remainder, documented.

## Explicitly out of scope

- **`implicit-fk` (10 entity references)** — accepted by design: entities carry plain
  ID columns without TypeORM relation decorators (DDD choice), recorded in the root
  `AGENTS.md` §3.4 on 2026-09-19. Not a deviation.
- **hotspots, test-ratio, logical-coupling, absent-patterns** — informational findings,
  no code change implied. `absent-patterns` explains the original report's
  "Tiers absent: Mapping": mapper/assembler patterns are configured but exist nowhere.
- **6 dead files** (4 folders shims, `download-audio.swagger.ts`, `tag.dto.ts`) —
  already deleted on `f5-dead-file-cleanup`; merge that branch first so this branch
  doesn't re-touch them.
- **metatron tooling** (6 `trace-stalled` diagnostics) — separate repo, separate arc.

## Deployment

Each phase ships to dev after its gates pass; prod2 promotion happens after the branch
is merged and the user has exercised the app.
