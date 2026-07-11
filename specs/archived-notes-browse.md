# Rough Spec — Browse & Restore Archived Notes

**Status:** STUB — surfaced as a prerequisite by merge-notes v2; needs its own Q&A
**Blocks:** `specs/merge-notes-v2-unmerge.md` (un-merge needs a way to see/restore archived sources)
**Author:** daedalus1215 + Claude

## Why this exists

Notes are soft-deleted via `notes.archived_at` (TypeORM `@DeleteDateColumn`), and the merge
feature archives source notes — **but there is no UI to see or restore archived notes today.**
Several features (merge un-do, general "trash/restore") need this. Speccing it once, here,
avoids each feature reinventing it.

## Scope sketch

- **List archived notes:** a new query/endpoint returning notes where `archived_at IS NOT
  NULL` for the user (paginated, mirror the explorer/name-list queries which currently filter
  archived out).
- **Restore:** un-set `archived_at` (a `restore-note` action mirroring the existing
  `archive-note` action — `PATCH /notes/:id/restore` or similar).
- **Permanent delete from archive:** optional — hard-delete path already exists
  (`DELETE /notes/:id`); an archive view is the natural place to expose it.
- **UI surface (open):** an "Archived" filter/tab in the Explorer vs a dedicated page vs a
  modal. Undecided.

## Open questions
- **AQ1.** Where does the archive list live? (Explorer filter / dedicated page / modal.)
- **AQ2.** Restore semantics: does a restored note return to its original `folder_id`? (It
  still has one — archiving doesn't clear it.) Confirm folder still exists; fallback to root
  if not.
- **AQ3.** Do we need bulk restore / bulk permanent-delete, or single-note only for v1?
- **AQ4.** Retention: auto-purge archived notes after N days, or keep forever?
- **AQ5.** Should check-items / tag associations (which have their own `archived_date`) be
  considered, or is note-level archive enough for the list?

## Notes
- The existing name/explorer list queries already filter on archived — restoring the archive
  view is mostly a matter of an inverted query + a restore mutation, plus the UI.
- This is independent of merge and could ship on its own; merge v2 simply consumes it.
