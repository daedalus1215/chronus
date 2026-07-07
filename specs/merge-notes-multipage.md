# Rough Spec — Expand Merge to Other Surfaces

**Status:** ROUGH DRAFT — needs a Q&A pass before it's actionable
**Depends on:** `specs/merge-notes-feature.md` (v1) shipping first
**Author:** daedalus1215 + Claude

v1 restricts merge to the **Explorer tree** (per Q12) because it already has multi-select
+ a bulk toolbar. This spec sketches bringing merge to the other note surfaces.

---

## Surfaces that could gain merge

| Surface | Path | Current selection model | Gap to add merge |
|---|---|---|---|
| **HomePage flat list** | `frontend/src/pages/HomePage/components/NoteListView/` | **single-select only** (`selectedNoteId`) | Add multi-select (checkbox mode) + a bulk toolbar. Biggest lift. |
| **Kanban board** | `frontend/src/pages/KanbanBoardPage/` | per-card | Card multi-select + a merge action; semantics of merging across columns TBD. |
| **Tag page** | `frontend/src/pages/TagPage/` | list of notes for a tag | Multi-select + merge; natural place ("merge everything tagged X"). |

The backend bulk endpoint from v1 (`POST /notes/merge`) is **surface-agnostic** — all these
need is a way to gather selected note ids + reuse the v1 dialog and hook. So this is
**frontend-only** work once v1 ships.

---

## Open questions for the Q&A pass

**MQ1. Which surface first?** (Ranked priority — HomePage, Kanban, Tag page?)

**MQ2. Shared multi-select?**
Should we extract the Explorer's multi-select logic (`selectedNoteIds`, Ctrl/Shift-click,
`pickItemsMode`) into a reusable hook/component so every surface behaves identically, or
implement per-surface? (Recommend extract — one behavior, less drift.)

**MQ3. HomePage selection UX.**
The HomePage list is name-only and cursor-paginated. Do we add a persistent checkbox
column, or a "select mode" toggle (like the Explorer's `pickItemsMode`)?

**MQ4. Kanban semantics.**
Merging cards across columns — what column/status does the merged note land in? (Target's
column wins, presumably.)

**MQ5. Cross-surface consistency.**
Same-type-only rule (memo XOR checklist) and "user picks primary" must hold everywhere.
Confirm no surface-specific exceptions.

---

## Rough design sketch (pending answers)
- Extract `useNoteMultiSelect` (state + keyboard + range) from `ExplorerTree.tsx`.
- Extract a `<MergeBulkAction>` toolbar button + the merge dialog wiring into a shared
  component consumed by each surface.
- Each surface just feeds `selectedNoteIds` + note-type info into the shared pieces.
- No backend changes (v1's `POST /notes/merge` already covers it).
