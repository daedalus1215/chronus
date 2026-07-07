# Spec — Merge Multiple Notes Into One

**Status:** Draft / gathering requirements
**Branch:** _TBD_ (feature not started)
**Author:** daedalus1215 + Claude

Select multiple notes and merge them: descriptions append, checklists append, time
tracks append. This document captures decisions already made, open questions for you
to answer at your leisure, and the proposed design grounded in the existing codebase.

---

## TL;DR — this is mostly already built

A `note-transfer` backend module + a frontend merge flow already exist for merging an
imported `.chronus` **file** into one note. Your feature ("N live notes → one note")
reuses ~70% of it. The real work:

1. Source content by **note id** instead of from an uploaded file.
2. Handle **N sources**, transactionally.
3. A **Merge** bulk button in the Explorer (multi-select already exists there).

---

## Decisions locked (your answers, 2026-07-06)

| # | Decision | Choice |
|---|----------|--------|
| 1 | **Merge target** — which note survives | **User picks the primary.** In the dialog you designate one selected note as the target; its title / folder / created-date survive. |
| 2 | **Source fate** — the non-target notes | **Archive them** (set `archived_at`, soft-delete). Reversible, reuses existing archive infra. |
| 3 | **Mixed types** — memo-notes vs checklist-notes | **Block mixed merges.** Only same-type selections allowed (all memos, or all checklists). The Merge button disables + explains when the selection is mixed. |
| 4 | **Confirm UX** | **Per-field review dialog.** Extend the existing `MergeSelectionDialog` so you can review/deselect descriptions / check-items / time-tracks before committing. |

---

## Open questions — answer at your leisure

> Fill in the **Answer:** lines. Anything left blank, I'll use the _Default_ shown and note it.

### Content ordering & formatting

**Q1. Order in which sources append.**
When descriptions/check-items/time-tracks from multiple sources append, in what order?
- (a) Selection order (order you clicked them)
- (b) Oldest → newest by `createdAt`
- (c) Alphabetical by title
_Default: (b) oldest → newest._
**Answer:** (b)

**Q2. Description separators.**
When source descriptions append under the target's, how are they delimited?
- (a) Raw concat with a blank line between
- (b) A horizontal rule (`---`) between each
- (c) A heading per source (e.g. `## <original note title>`) so provenance is visible
_Default: (c) heading per source — you can always delete them._
**Answer:** (c)

### Check-items (checklists)

**Q3. Dedupe or blind append?**
If two source checklists both have an item "Buy milk", do you want one copy or two?
- (a) Blind append — keep every item, duplicates and all
- (b) Dedupe by name (case-insensitive)
_Default: (a) blind append. Dedupe risks silently dropping a real item that shares a name._
**Answer:** (a)

**Q4. Carry item state?**
Should each appended item keep its `status` (ready/in_progress/review/done), `doneDate`,
`archiveDate`, and `description` exactly as-is? (Order is auto-rebased onto the target.)
_Default: yes, carry everything as-is; skip already-archived items._
**Answer:** yes

### Time tracks

**Q5. Preserve per-entry annotation.**
Each time track has a free-text `note` field (a per-entry annotation). The *existing*
file-merge silently drops it. Preserve it for this feature?
_Default: yes, preserve the annotation._
**Answer:** yes,  preserve the annotation.

**Q6. Overlap handling.**
Time tracks are historical records. Merge just appends every source track to the target
(new rows). Any handling of overlapping intervals or duplicate entries?
- (a) Blind append — every track becomes a row on the target
- (b) Skip exact duplicates (same date + start + duration)
- (c) Detect & warn on overlaps, let you resolve in the dialog
_Default: (a) blind append; the dialog already has duplicate-time-track detection we can surface._
**Answer:** (a)

### Tags

**Q7. Union tags?**
Should the target note gain the union of all source notes' tags (deduped by name)?
- (a) Yes — union all tags onto the target
- (b) No — target keeps only its own tags
- (c) Let me pick tags in the dialog
_Default: (a) union, deduped. The tag-attacher already dedupes by name._
**Answer:** (a) union and deduped by name

### Guardrails & scope

**Q8. Maximum notes per merge?**
Minimum is 2. Any upper cap (e.g. 20) to avoid a runaway merge?
_Default: soft cap of 25; warn above that._
**Answer:** The cap really needs to be if the descriptions combined will exceed what the database will allow for a description/textarea of a memo.

**Q9. Cross-folder merges.**
Can you merge notes that live in different folders? (Target's folder wins.)
_Default: yes, allowed._
**Answer:** yes, target folder wins.

**Q10. Audio attachments.**
Notes can have audio history (`SidebarAudioHistoryView`). You listed description /
checklist / time-tracks — should **audio** attachments also merge onto the target, or be
left on (archived) sources?
- (a) Merge audio too
- (b) Leave audio on sources (out of scope for v1)
_Default: (b) out of scope for v1 — call it out in the PR._
**Answer:** ~~(a)~~ → **Revised 2026-07-06: delete source audios on merge.** Hermes doesn't
allow moving files, so rather than carry audio to the target (or leave it stale on archived
sources), the merge **deletes** each source note's audio (Hermes file + DB row). Target gets
no audio; audio content is destroyed (irreversible). Plain delete, no mandatory warn step.

**Q11. Undo.**
Since sources are archived (not deleted), "undo" ≈ un-archive the sources + strip the
appended content from the target. Full transactional undo is a lot of work. Acceptable to
ship **one-way** (sources recoverable from archive, but no automatic un-merge)?
_Default: yes, one-way for v1._
**Answer:** Yes, one way for v1. Let's just make a spec for v2 that allows us to un-archive the source. That is a separate ticket and spec for sure. We will have to play with the idea of how we list the archived memos and stuff. SO maybe it needs to be a rough spec, that will indicate we need to fill it in with more Q/A.

**Q12. UI surface.**
The Explorer tree already has multi-select + a bulk toolbar — the natural home. The
HomePage flat list is single-select only. Restrict merge to the **Explorer** for v1?
_Default: yes, Explorer only._
**Answer:** Yes, Explorer only. Can create a spec, where we can explore expanding to other pages.

**Q13. Atomicity.**
N-into-1 should be transactional (all-or-nothing) rather than N sequential merge calls
that can half-fail. This means a new bulk endpoint. Agreed?
_Default: yes — new transactional bulk endpoint._
**Answer:** yes

---

## Proposed design (grounded in current code)

### Data model recap
- **Note** (`notes` table): `id`, `name` (title), `user_id`, `memo_id` (→ `memos`),
  `folder_id`, `sort_order`, `archived_at` (soft-delete), `created_at`.
- **Description** lives on the related **Memo** (`memos.description`, `text`). A note is a
  memo (`isMemo`) *or* a checklist (has `check_items`) — hence decision #3 blocks mixing.
- **CheckItem** (`check_items`): `name`, `description`, `status`, `done_date`,
  `archived_date`, `order`, `note_id`.
- **TimeTrack**: `date`, `start_time`, `duration_minutes`, `note` (free-text annotation),
  `user_id`, `note_id`.
- **Tags** via join table `tag_notes` (`tag_id`, `notes_id`).
- **Audio** (`note_audios`): `note_id`, `file_path` (opaque key into external **Hermes**
  store — bytes live there, not in the DB), `file_name`, `file_format`,
  `last_position_seconds`, `duration_seconds`. **No `user_id`** — ownership is derived
  through the note.

### Backend — new action in `note-transfer` module
Model on the existing single-note `mergeIntoNote` in
`backend/src/note-transfer/domain/services/note-transfer.service.ts`.

- **Endpoint:** `POST /notes/merge` (bulk). Body: `{ targetNoteId, sourceNoteIds[], selections }`.
  (Distinct from the existing `POST /notes/:id/merge` file-merge.)
- **Reads** (per source, via aggregators): `NoteAggregator.getMemoById`,
  `CheckItemsAggregator.findByNoteId`, `TimeTracksAggregator.findByNoteId`,
  `TagAggregator.getTagNamesByNoteId`.
- **Writes** (into target, existing ports — all reusable):
  - `NoteWriterPort.replaceDescription(targetId, concatenatedDescription)`
  - `CheckItemWriterPort.bulkCreate(targetId, items)` — **auto-rebases `order`** onto target's max.
  - `TimeTrackWriterPort.bulkCreate(targetId, userId, logs)` — extend to carry the `note` annotation (Q5).
  - `TagAttacherPort.attachByName(targetId, userId, tagNames)` — **dedupes by name** (Q7).
  - **NEW** `AudioPurgePort.purgeByNoteIds(sourceNoteIds, userId)` (Q10, revised 2026-07-06) —
    audio is **NOT** carried to the target. Hermes does not permit moving files, so instead
    we **delete** every source note's audio to avoid leaving stale files. For each source
    audio: Hermes `delete-by-path` **then** delete the `note_audios` row (reuse the existing
    delete-audio path so Hermes and DB stay in sync). New adapter in the audio module +
    likely a `NoteAudioRepository.findByNoteIds` / `deleteByNoteId` pairing.
    **⚠️ Audio content is destroyed by the merge — irreversible.**
- **Ordering (Q1):** process sources **oldest → newest by `createdAt`** for every appended
  section.
- **Description assembly (Q2):** target's description first, then each source under a
  `## <source note title>` heading. Blind append — no dedupe.
- **Check-items (Q3/Q4):** blind append (keep duplicates); carry `status` / `doneDate` /
  `archiveDate` / `description` as-is; skip already-archived items; `order` auto-rebased.
- **Time-tracks (Q5/Q6):** blind append every row; **preserve the per-entry `note`
  annotation** (extend `TimeTrackWriterPort.bulkCreate` to carry it — the current file-merge
  drops it).
- **Then:** archive each source via the archive path (`archived_at`), and **purge source
  audios** (Q10).
- **Transaction boundary (Q13) + Hermes caveat:** the DB writes (append content, archive
  sources, delete `note_audios` rows) go in one transaction. **Hermes `delete-by-path` is a
  remote side-effect that cannot participate in the DB transaction.** Ordering to avoid data
  loss on rollback: do all DB work (including deleting the `note_audios` rows) inside the
  txn and commit; issue Hermes `delete-by-path` calls **after commit**, best-effort with
  logging. Worst case on a Hermes failure = an orphaned Hermes blob (recoverable via a
  cleanup sweep), never a lost note. Capture the file paths before deleting the rows.
- **Validation:** all notes owned by `user_id`; ≥2 notes; same type (block mixed, #3);
  target ∈ selection.
- **Cap (Q8):** `memo.description` is SQLite `TEXT` (~1 GB ceiling) with **no DTO length
  validation** — so there is **no meaningful note-count cap**. Add a defensive guard that
  rejects a merge whose *combined* description would exceed a generous soft limit
  (proposed **1,000,000 chars**) purely as a runaway backstop, surfaced as a clear error.
- Follow repo migration/action conventions in `CLAUDE.md` (one concern per action; request
  DTO lives with the action).

### Frontend — extend Explorer + merge dialog
- **Trigger:** new **Merge** button in
  `frontend/src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeHeader.tsx`, next to
  the existing bulk "Move to folder" button; enabled when ≥2 same-type notes selected
  (reuse `selectedNoteIds`).
- **Primary picker + review:** extend
  `frontend/src/pages/HomePage/components/MergeSelectionDialog/MergeSelectionDialog.tsx`
  to (a) source content from selected note ids instead of a `.chronus` file, (b) let you
  designate the primary/target (#1), (c) review/deselect per field (#4).
- **API:** new `mergeNotes(payload)` in
  `frontend/src/api/requests/notes.requests.ts` + a `useMergeNotes` hook modeled on
  `useMergeIntoNote.ts`; invalidate `['notes']`, `['checkItems']`, `['noteTags']`,
  `['tags']`, `['timeTracks']`, `['timeTracksTotal']`.
- **Types:** extend `MergeIntoNoteData` (currently in `useMergeIntoNote.ts`) to the bulk shape.

### Key reference files
- Backend template: `backend/src/note-transfer/domain/services/note-transfer.service.ts`
- Backend ports: `backend/src/note-transfer/domain/ports/*`
- Write adapters: `backend/src/check-items/apps/adapters/check-item-writer.adapter.ts`,
  `backend/src/time-tracks/apps/adapters/time-track-writer.adapter.ts`
- Audio (new reassign): `backend/src/audio/infrastructure/repositories/note-audio.repository.ts`,
  entity `backend/src/audio/domain/entities/note-audio.entity.ts`
- Explorer multi-select: `frontend/src/pages/ExplorerPage/components/ExplorerTree/ExplorerTree.tsx`
- Bulk toolbar: `.../ExplorerTree/ExplorerTreeHeader.tsx`
- Merge dialog: `frontend/src/pages/HomePage/components/MergeSelectionDialog/MergeSelectionDialog.tsx`
- Merge hook: `frontend/src/pages/HomePage/hooks/useMergeIntoNote.ts`

---

## Open risks / notes
- **Type-mixing UX:** with #3 (block mixed), the Merge button needs a clear disabled-state
  reason when the selection mixes memos and checklists.
- **`isMemo` type mismatch:** list DTOs expose `isMemo` as `number`, the detail `Note` type
  as `boolean` — reconcile when computing same-type validation on the client.
- **Time-track annotation drop:** the current file-merge payload omits the per-entry `note`;
  don't inherit that bug (Q5).
- **Audio is destroyed on merge (Q10):** source audios are deleted (Hermes file + row), not
  carried to the target. Irreversible — and it makes un-merge (v2) unable to restore audio.
  Consider showing the to-be-deleted audio count in the review dialog as info (the user
  opted out of a *mandatory* warn step, so keep it non-blocking). Noted in
  `specs/merge-notes-v2-unmerge.md`.
- **Hermes deletes aren't transactional:** see the transaction-boundary note above — purge
  after DB commit, best-effort, to avoid ever losing a note on rollback.
- **Audio not in `.chronus` export:** audio is absent from the existing export/import/merge
  payload, so the purge is net-new plumbing (a new port + repo method + adapter).
- **Audio-preserving future:** Hermes gaining a move endpoint would let merge *move* audio to
  the target instead of deleting it. Specced in `specs/hermes-audio-move.md`; keep the audio
  step behind a single port so swapping purge→move is localized.

---

## Edge cases & validation (v1 loose ends)

Server-side rules for `POST /notes/merge` — reject with a clear 400/404 unless noted:

1. **Count:** `sourceNoteIds` (excluding target) ≥ 1, i.e. ≥ 2 notes total. Reject empty /
   single selections.
2. **Target ∈ selection:** `targetNoteId` must be one of the selected ids. De-dupe the id
   list defensively (same id twice = one note).
3. **Ownership:** every note id must belong to the caller (`userId`); a foreign or unknown id
   fails the whole merge (atomic — nothing partially applied).
4. **Not already archived:** reject if any selected note (target or source) is already
   archived. Merging into/from a dead note is almost certainly a stale-client bug.
5. **Same type (#3):** all selected notes must be the same kind (all memo, or all checklist).
   Compute server-side too — never trust the client's `isMemo`. Reject mixed with a specific
   message.
6. **Combined description guard (Q8):** if the assembled description would exceed the soft
   limit (~1,000,000 chars), reject with a length error rather than write a monster row.
7. **Optimistic concurrency:** carry a `version`/`updatedAt` for the **target** so a merge
   built against a stale target is rejected (mirror the single-note merge's `version`).
   Sources are archived, not concurrently edited, so no per-source version is needed.

Post-merge state:
- Target keeps its own `name`, `folder_id`, `sort_order`, `created_at`; `updated_at` bumps.
- Sources: `archived_at` set; their existing tag/check-item rows stay attached to the (now
  archived) source — we **copy** into the target, we don't move (except audio, which is
  deleted). No cleanup of source content rows in v1.
- **Realtime:** if the app pushes socket events elsewhere on note change, emit/scope
  invalidation so other clients drop the archived sources; otherwise rely on the frontend
  query invalidation listed above. Confirm during implementation whether a socket event is
  expected here.

Empty-section simplifications (thanks to #5 same-type):
- All-checklist merge → no descriptions/memo in play; target stays a checklist.
- All-memo merge → no check-items in play; target stays a memo.
