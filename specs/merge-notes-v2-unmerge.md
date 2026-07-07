# Rough Spec — Un-merge / Restore Archived Sources (Merge v2)

**Status:** ROUGH DRAFT — needs a Q&A pass before it's actionable
**Depends on:** `specs/merge-notes-feature.md` (v1) shipping first
**Author:** daedalus1215 + Claude

v1 merges N notes into a target and **archives** the sources (one-way, per Q11). This
spec sketches v2: letting the user reverse that — un-archive the sources and (optionally)
strip the appended content back off the target. This is explicitly a **separate ticket**.

---

## The core problem

Because v1 does a *copy-then-archive* (not a move), after a merge the content exists in
**two** places: appended on the target, and still on the now-archived sources. "Undo"
therefore has two independent halves that the user may want separately:

1. **Restore sources** — un-archive the source notes so they reappear intact.
2. **Un-append from target** — remove the content that was copied onto the target.

These are not the same action and shipping (1) without (2) is viable (and much simpler).

---

## Open questions for the Q&A pass

**UQ1. What does "un-merge" mean to you?**
- (a) Just un-archive the sources; leave the target as-is (content now duplicated — user cleans up)
- (b) Un-archive sources AND strip the appended content from the target (true reversal)
- (c) Both offered as separate buttons

**UQ2. How do we even find what to un-merge?**
v1 does not currently record a "merge event" linking a target to its sources. To offer
un-merge we likely need to **persist merge provenance** — e.g. a `merge_events` table
(target_note_id, source_note_ids[], timestamp, per-field manifest of what was copied) OR
tag each copied row with a `merge_batch_id`. Which granularity?
- (a) No persistence — user manually un-archives from an archive list, no target cleanup
- (b) Lightweight: record merge events for listing/undo, no per-row manifest
- (c) Full manifest: every appended check-item/time-track/audio row tagged with a batch id so (b)-style strip is exact

**UQ3. Where do archived notes get listed?**
There's currently **no archived-notes browse UI** (archive is a soft-delete via
`archived_at`, but nothing lists them). v2 needs one. Is that:
- (a) A new "Archived" view/filter in the Explorer
- (b) A modal reachable from the merge history
- (c) Part of a broader "trash/archive" feature (separate spec again)

**UQ4. Time window / expiry.**
Is un-merge available forever, or only for a window (e.g. undo toast for 30s, or 30 days)?

**UQ5. Edge cases after merge.**
If the user edited the target's description (which now contains merged content) before
un-merging, a clean strip may be impossible. Behavior?
- (a) Best-effort strip; warn if the merged block was modified
- (b) Refuse strip if target changed since merge; only offer source restore
- (c) Snapshot the target's pre-merge state to restore exactly

---

## Rough design sketch (pending answers)

- **Provenance:** a `merge_events` table + optional `merge_batch_id` columns on the copied
  rows (check_items, time_tracks, audio) — decided by UQ2.
- **Restore sources:** un-set `archived_at` on the source notes (mirror the existing
  archive action; likely a new `restore-note` action).
- **Strip target:** using the manifest, delete the appended rows and restore the memo's
  pre-merge `description` (needs a pre-merge snapshot, UQ5c).
- **UI:** an "Archived" Explorer filter (UQ3) + an "Un-merge" affordance on notes that
  were merge targets.

## Audio cannot be restored by un-merge
v1 **deletes** source-note audios on merge (Hermes file + row — Hermes doesn't allow moving
files). That deletion is permanent, so un-merge/restore **cannot** bring audio back even if
it restores the source note and strips the target. Any v2 un-merge UI must say this plainly.
If audio-preserving merges are ever wanted, that's a separate change to v1 (e.g. Hermes gains
a copy/upload capability) — not something v2 can retrofit.

## Provenance schema sketch (if UQ2 → b/c)

To list and reverse merges we need to persist what happened. Rough shape:

```
merge_events
  id            PK
  user_id
  target_note_id
  source_note_ids   (json array)
  created_at
  -- optional (UQ2=c, exact strip):
  description_snapshot   (target's pre-merge memo.description, text)

merge_batch_id   -- optional column added to copied rows
  check_items.merge_batch_id      → FK-ish to merge_events.id
  time_tracks.merge_batch_id
```
- **UQ2=b (list only):** just `merge_events` — enough to show history and offer "restore
  sources"; target is left as-is.
- **UQ2=c (exact strip):** add `merge_batch_id` to the copied `check_items` / `time_tracks`
  rows + the `description_snapshot`, so un-merge can delete exactly the appended rows and
  restore the prior description.

## Prerequisite feature this exposes
An **archived-notes browsing UI** does not exist yet and is a hard dependency — now specced
separately in **`specs/archived-notes-browse.md`**. Merge v2's "restore sources" is just that
feature's restore action, invoked for a merge event's `source_note_ids`.
