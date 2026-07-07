# Spec — Hermes "Move Audio" Capability (enables audio-preserving merge)

**Status:** Draft — assessment done, needs a short Q&A pass
**Implementation repo:** `~/Nextcloud/nebechaunezzer/programming/hermes` (Python/FastAPI)
**Consumer:** Chronus `note-transfer` merge (`specs/merge-notes-feature.md`)
**Author:** daedalus1215 + Claude

## Why this exists

Merge-notes v1 (`specs/merge-notes-feature.md`, Q10 revised) **deletes** source-note audio
because Hermes has no way to move a file from one note's folder to another's. This spec adds
that capability to Hermes so a later merge revision can **preserve** audio (move it onto the
target note) instead of destroying it.

## Hermes assessment (as-is, verified by reading the code)

- **Framework:** FastAPI (`app/application/api_controller/api_controller.py`), Kokoro TTS.
- **Storage layout:** on disk, `{audio_base_dir}/{user_id}/{asset_id}/{filename}` where
  `asset_id` = the Chronus **note id**, and `filename` is timestamped
  (`combined_YYYY-MM-DD_HH-MM-SS.wav`, see `app/shared/path_utils.py`). Multiple audio files
  can exist per note folder.
- **Existing endpoints:**
  - `POST /text-to-speech` — generate audio for `{userId, assetId, text}`; returns absolute
    `file_path` + `file_name`.
  - `GET /download/{user_id}/{asset_id}` — download by folder identity (defaults to `combined.wav`).
  - `GET /download-by-path?file_path=` — download by absolute path (validated to live under
    the process-folder parent).
  - `DELETE /delete-by-path?file_path=` — delete one file by absolute path; also removes the
    now-empty parent dir.
  - `GET /health`.
- **No move and no copy endpoint exists.** This is the entire gap.
- **Architecture to mirror:** controller route → `*TransactionScript` (+ `*Factory`) →
  repository under `app/infrastructure/repositories/write/`. `shutil` is already used
  (`write_audio_files_repository.py`), so `shutil.move` / `shutil.copy2` are the natural tools.
- **Path safety pattern to reuse:** every path endpoint resolves the path and asserts
  `requested_path.relative_to(process_parent)` before touching disk — the move endpoint must
  do the same for **both** source and destination.
- **Auth:** the Hermes API itself is unauthenticated (it's an internal service; Chronus is the
  only caller and holds the absolute paths). The move endpoint inherits that trust model —
  see OQ5.

## Proposed Hermes change

### New endpoint (recommended: move by path)
```
POST /move-by-path
body: { source_file_path: str, target_user_id: str, target_asset_id: str }
→ 200 { file_path: <new absolute path>, file_name: <possibly-renamed filename> }
```
Behavior:
1. Resolve `source_file_path`; assert it lives under `process_parent` (reuse existing guard).
2. Compute destination dir `get_user_path_for_asset(process_folder, target_user_id, target_asset_id)`;
   assert it too resolves under `process_parent`; `os.makedirs(dest, exist_ok=True)`.
3. **Collision policy (OQ3):** if `dest/<filename>` already exists, rename to a fresh
   timestamped name (`generate_timestamped_filename()`), never overwrite.
4. `shutil.move(source, dest/<final_name>)`.
5. Clean up the source's now-empty asset dir (mirror `delete-by-path`'s `rmdir` on empty).
6. Return the new absolute `file_path` + `file_name`.

Implemented as `MoveAudioByPathTransactionScript` (+ factory) → a repository method
`move_file(source_path, dest_dir) -> Path` on a write repository, using
`asyncio.to_thread(shutil.move, ...)` to match the async, thread-pooled I/O style.

### Alternative considered: whole-folder move
`POST /move/{user_id}/{source_asset_id}/{target_asset_id}` moves every file from the source
note's folder to the target's. Simpler for "move all a note's audio" but Chronus already
tracks each file individually (one `note_audios` row per file with its own `file_path`), and
per-file move gives cleaner error attribution. **Recommend per-file `move-by-path`.**

## Chronus-side consumption (the payoff)

When this ships, flip merge audio handling from *purge* to *move-and-reassign*:
- Replace `AudioPurgePort.purgeByNoteIds` with `AudioMovePort.moveByNoteIds(sourceNoteIds,
  targetNoteId, userId)`:
  1. For each source `note_audios` row: call Hermes `POST /move-by-path` with the row's
     `file_path` + the **target** note id → receive the new `file_path`.
  2. Update the row: `note_id = target`, `file_path = <new path>` (keep `file_name`,
     `duration_seconds`, `last_position_seconds`).
- **Transaction/rollback caveat (same shape as the purge caveat):** the Hermes move is a
  remote side-effect outside the DB transaction. Sequence: perform Hermes moves first,
  collecting `(rowId → newPath)`; then update rows inside the DB txn. If a later step fails,
  the files are already moved — a compensating "move back" is best-effort. Because move (not
  delete) is non-destructive, the failure mode is "audio attached to target instead of
  archived source," which is benign. Prefer this ordering over deleting.
- This makes merge audio-preserving and also unblocks **v2 un-merge** restoring audio
  (currently impossible under delete — see `specs/merge-notes-v2-unmerge.md`).

## Open questions (Hermes-side)

**OQ1. Move vs copy.** For merge, **move** (source archived) is right. Do you also want a
`copy` variant for other future use cases, or move-only for now? _Default: move-only._

**OQ2. Per-file or whole-folder API.** _Default: per-file `move-by-path` (matches Chronus's
per-row model)._

**OQ3. Filename collision at destination.** Rename to a fresh timestamp (never overwrite) vs
reject. _Default: rename, never overwrite._

**OQ4. Cross-user moves.** Merge is always same-user, so the target folder is under the same
`user_id`. Should the endpoint **forbid** a move whose destination user differs from the
source's, as a guard? _Default: not enforced (Chronus guarantees same user); revisit if
Hermes ever gets multi-tenant checks._

**OQ5. Auth.** Hermes is currently unauthenticated/internal. Add any shared-secret/header
check for the mutating move endpoint, or keep parity with the existing (unauthenticated)
`delete-by-path`? _Default: parity with `delete-by-path` — no new auth in this spec._

**OQ6. Sequencing with v1.** Ship v1 merge with **delete** (as decided) and treat this
move-capability as a fast-follow that flips the behavior? Or hold v1's audio handling until
Hermes move lands? _Default: ship v1 with delete; this is a fast-follow._

## Test notes (Hermes)
- Unit: move relocates the file, returns the new path, cleans the empty source dir, and
  renames on collision. Reuse the path-safety rejection tests from `delete-by-path`.
- The Hermes `__specs__/` dir is currently empty — establish the pytest location when
  implementing.
