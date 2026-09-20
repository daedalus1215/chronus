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

### Phase 3 — the 15 untested-risk files (complete, 2026-09-20)

Triaged with the notes-F1 bar: a test earns its place only where a plausible bug would
fail it (entity shape/defaults, service orchestration, repository query correctness).
Pure wiring (module files, logic-less decorators/DTOs) is reported as intentionally
untested rather than padded with tests that assert plumbing.

**Result: 12 new spec files, 81 tests, all green.** Each spec sits in `__specs__/`
next to its source with a name matching the source (metatron credits by name);
integration specs carry the `.integration.spec.ts` infix required by
`test/jest-integration.json` (the unit config's `testPathIgnorePatterns` keeps them
out of the default suite).

| Source | Spec | Tests |
|---|---|---|
| `notes/.../note.entity.ts` | `note.entity.integration.spec.ts` | 3 |
| `notes/.../memo.entity.ts` | `memo.entity.integration.spec.ts` | 1 |
| `check-items/.../check-item.entity.ts` | `check-item.entity.integration.spec.ts` | 2 |
| `check-items/.../check-item.service.ts` | `check-item.service.spec.ts` | 4 |
| `check-items/.../check-items.repository.ts` | `check-items.repository.integration.spec.ts` | 14 |
| `time-tracks/.../time-track.entity.ts` | `time-track.entity.integration.spec.ts` | 1 |
| `time-tracks/.../time-track.service.ts` | `time-track.service.spec.ts` | 9 |
| `time-tracks/.../time-track.repository.ts` | `time-track.repository.integration.spec.ts` | 18 |
| `tags/.../tag.entity.ts` | `tag.entity.integration.spec.ts` | 1 |
| `tags/.../tag.repository.ts` | `tag.repository.integration.spec.ts` | 11 |
| `audio/.../audio.service.ts` | `audio.service.spec.ts` | 12 |
| `shared-kernel/.../get-auth-user.decorator.ts` | `get-auth-user.decorator.spec.ts` | 5 |

Pinned: DB defaults (check-item status 'ready'/order 0, note sortOrder 0, memo/tag
description ''), ownership scoping (findByIdWithNoteValidation, findTagByIdAndUserId,
delete/update by user, downloadAudio 403s), ordering (ASC + date DESC / startTime
DESC, `Between` boundaries inclusive both ends), streak math (bug below), SUM
scoping, searchByQuery case-insensitivity + archived exclusion, TTS/memo gating,
content-type mapping, `GetAuthUser` key extraction (the spec resolves the factory
`createParamDecorator` stores under `__routeArguments__` and invokes it exactly as
NestJS's route-params-extractor does — real factory exercised, no re-implementation).

**Intentionally untested (3 of the 15):**
- `notes/notes.module.ts` — pure DI wiring.
- `notes/apps/dtos/responses/note.response.dto.ts` — ApiProperty metadata only.
- `shared-kernel/apps/decorators/protected-action.decorator.ts` — decorator wiring;
  enforcement is covered by e2e auth behavior.

**Findings surfaced by the tests (source untouched — report, don't fix):**
1. **Bug — `TimeTrackRepository.getCurrentStreak` always returns 0.** pg returns
   `DATE` as JS `Date` objects, so `activeDates` is a `Set<Date>`, but membership is
   checked with strings (`activeDates.has(dateStr)`) — never matches. Pinned as
   "returns 0 even when …"; the tests flip red if the bug is fixed.
2. **Type mismatch — `getTotalTimeForNote` / `getDailyTotal`** declared
   `Promise<number>` but return pg numeric strings (`"240"`) when rows exist;
   downstream `TimeTrackTotalResponseDto` survives via JS arithmetic coercion.
3. **Type mismatch — `GetTagsByUserIdProjection.id`** declared `string`, runtime
   `number` (pg `int4` passed through by the hydrator).
4. Pinned as-is (not bugs): `getMinOrderByNoteId` empty-case returns `0` (vs
   `getMaxOrder`'s `-1`); `findTagsByNoteIds` returns a Map keyed by EVERY requested
   noteId (empty arrays included); archived tag_notes excluded only from `noteCount`;
   no FK on `check_items.note_id` / `time_tracks` (entity specs need no parent seeds).

**Tooling note:** metatron's nestjs profile only credits `__specs__/<name>.spec.ts` —
which is why the pre-existing `note-memo-tag.repository.integration.spec.ts` never
suppressed its flag. The chronus scan config gains a
`__specs__/<name>.integration.spec.ts` locator before the final re-scan.

**Verify:** all 12 suites green after prettier — unit 30/30
(`NODE_ENV=test npx jest <unit specs>`); integration 51/51
(`NODE_ENV=test DB_NAME=chronus_test_{ci,tt,tags,ne} npx jest --config
test/jest-integration.json <module>`).

### Phase 3.5 — the 12 files the rolling top-15 newly surfaced (complete, 2026-09-20)

After the Phase 3 re-scan, the untested-risk top-15 (rolling over ~289 untested files,
scored `commits × (1+dependents)`) lost the 12 Phase 3 files and surfaced 12 that had
never been flagged: 5 `*.module.ts` files, 1 response DTO, and 6 substantive files.
Triaged with the same Phase 3 bar.

**Result: 5 new spec files, 27 tests, all green.** The 6th substantive file
(`jwt-auth.guard.ts`) has no independently testable logic — see intentionally untested.

| Source | Spec | Tests |
|---|---|---|
| `check-items/.../check-items.aggregator.ts` | `check-items.aggregator.spec.ts` | 5 |
| `audio/.../hermes.remote-caller.ts` | `hermes.remote-caller.spec.ts` | 16 |
| `audio/.../note-audio.entity.ts` | `note-audio.entity.integration.spec.ts` | 2 |
| `folders/.../folder.entity.ts` | `folder.entity.integration.spec.ts` | 2 |
| `shared-kernel/.../tag-note.entity.ts` | `tag-note.entity.integration.spec.ts` | 2 |

Pinned: aggregator ownership-validated lookup, non-archived-first stable ordering,
projection shape, `bulkCreate` order rebase onto the note's current max order
(existing orders `[0,4,2]` → incoming land at `[5,6]`; empty note → `[0,1]`) with a
single `saveMany` carrying the full field set; hermes caller constructor env gating
(`HERMES_API_URL`), trailing-slash normalization, request shapes for
`convertTextToSpeech`/`downloadAudio`/`deleteAudioByPath`/`downloadAudioByPath` (URL,
body, headers, `responseType`, params), `sanitizeText` allowlist (newlines/tabs/
multi-spaces collapsed; `$ & *` and all quote forms — straight AND curly — stripped,
not normalized), and error mapping (404 and 500-with/without-`detail` → `HttpException`
with the exact message; unmapped 502, network, and non-axios errors rethrown as-is;
`deleteAudioByPath` 404 resolves silently); entity DB defaults (`note_audios`
position/duration null, `folders` sortOrder 0 / parentId null, `tag_notes` archivedDate
null) plus explicit round-trips (reals, `timestamptz` to the millisecond, `tag_notes`
with real `tags`/`notes` FK seeds).

**Intentionally untested (7 of the 12):**
- `time-tracks/time-tracks.module.ts`, `tags/tags.module.ts`,
  `check-items/check-items.module.ts`, `auth/auth.module.ts`,
  `audio/audio.module.ts` — pure DI wiring.
- `check-items/apps/dtos/responses/check-item.response.dto.ts` — ApiProperty
  metadata only.
- `shared-kernel/apps/guards/jwt-auth.guard.ts` — a 5-line
  `class JwtAuthGuard extends AuthGuard('jwt') {}` with no `canActivate` override;
  all 22 usages are bare `@UseGuards(JwtAuthGuard)`. A spec would assert the
  re-export (plumbing) or test @nestjs/passport itself. Note the real auth logic
  (`auth/jwt.strategy.ts`, `auth/domain/auth.service.ts`) is itself untested — a
  genuine gap, out of scope for this arc (not in the top-15).

**Findings surfaced by the tests (source untouched — report, don't fix):**
1. **Latent duplication bug — `CheckItemsAggregator.findByNoteId`.** The non-archived
   filter uses `doneDate == null` (loose — catches `null` AND `undefined`) while the
   archived filter uses `doneDate !== null` (strict — `undefined !== null` is true),
   so an item whose `doneDate` is *unset* (`undefined`) lands in **both** groups and
   is emitted twice. DB-hydrated items always carry `null` or a `Date`, so only
   in-memory entities with an unset `doneDate` trigger it. The quirk is pinned as
   written by a dedicated test; the main ordering test uses `null`
   (production-realistic) and asserts the clean split.
2. **Dead DI dependency — `CheckItemsAggregator` injects
   `GetCheckItemsByNoteTransactionScript`** (constructor) but never references it;
   `CheckItemService` carries its own copy and uses it correctly.
3. **Dead code — `HermesRemoteCaller.sanitizeText` quote normalization.** The
   normalization replaces (curly/straight → straight) run *after* the strip
   `.replace(/[^\w\s.,!?-]/g, '')`, which deletes every quote character first — the
   replaces are unreachable for their intended characters. Actual behavior: quotes
   are removed, not normalized. Pinned by two tests.
4. Minor: `hermes.remote-caller.ts` constructor comment says "remove any trailing
   slashes" but the code then re-appends exactly one, so the base URL always ends in
   `/` — pinned by the URL assertions in every request-shape test.

**Verify:** unit 21/21 (`NODE_ENV=test npx jest <aggregator spec> <hermes spec>
--silent`); integration 6/6 (`NODE_ENV=test DB_NAME=chronus_test_p35 npx jest
--config test/jest-integration.json <3 entity specs> --runInBand`).

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
