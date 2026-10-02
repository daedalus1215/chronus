# Spec — Tag Editing and Deletion

**Status:** IMPLEMENTED — duplicate-name rejection deferred (see Decisions)
**Author:** daedalus1215 + omp

## Why

Today the only tag interactions are **create** (sidebar `AddTagForm`),
**assign**, and **unassign**. There is no way to **edit a tag's name** or
**delete a tag** — even though most of the machinery already exists and is
partially broken:

| Surface | State today |
|---|---|
| Backend `PATCH /tags/:id` | Exists. No name validation: empty, whitespace-only, and duplicate names are all accepted. |
| Backend `DELETE /tags/:id` | Exists. **500s for any tag attached to a note** — `tag_notes.tag_id` has `ON DELETE NO ACTION` and `removeTag` only deletes the tag row, so Postgres refuses. |
| Frontend `updateTag` / `deleteTag` request fns | Exist, only used by the flat tag list. |
| Mobile tag list (`MobileTagListView` → `TagItem`) | Full ⋮ menu built: edit form (name + description), delete confirm dialog, wired to the API. Delete fails server-side for any tag in use; update errors are silent (no `onError`). |
| Desktop tag page (tree, `CustomTagTreeItem`) | Tag rows have **no actions at all** — only note rows get the ⋮ menu. This is what the user sees. |
| `DesktopTagListView` (flat list, desktop) | Dead code — `TagPage` uses the tree panel on desktop. |

## Decisions

| Question | Decision |
|---|---|
| Trigger surface | Desktop: ⋮ on **tag rows in the tree** (mirrors the note-row ⋮). Mobile: the existing flat-list ⋮ (fixed, not rebuilt). |
| Edit form | Reuse the existing `TagForm` (name + description) inside a shared panel; no new form. |
| Delete semantics | Delete the tag **and all of its note associations** (active and soft-archived). Notes are otherwise untouched. Confirm dialog states how many notes are affected. |
| Name validation | Trim on save; reject empty-after-trim (`400`); `@MaxLength(255)` on the DTO. |
| Duplicate-name policy | **Deferred** — duplicates remain allowed on both create and rename. The create path (`add-tag-to-note`) has always allowed them, so rejecting them only on rename would be inconsistent; revisit if duplicates become a real nuisance. |
| Deleting the open tag | If the deleted tag is the currently open tag (`/tag-notes/:id`), navigate back to `/tags`. |
| Scope | Name + description edit and delete from the tag page (desktop tree, mobile list). Out of scope: tag merging, tag colors, edit/delete from the note sidebar's tag list (sidebar stays assignment-only), bulk operations, Explorer page. |

## Backend changes

1. **`infra/repositories/tag-repository/tag.repository.ts`**
   - `removeTagAssociations(tagId)`: `DELETE FROM tag_notes WHERE tag_id = :tagId`
     (covers `archived_date` rows too).
2. **`delete-tag-TS`**
   - Call `removeTagAssociations(tagId)` before `removeTag(tag)`.
   - Spec update: associations removed, notes untouched.
   - Integration spec (extend existing `tag.repository.integration.spec.ts`):
     deleting a tag with active + archived associations succeeds; no FK
     error; the note's other tags survive.
3. **`update-tag-TS` + `update-tag.dto.ts`**
   - Trim `name`; `400` when empty after trim.
   - Store the trimmed name.
   - DTO: `@MaxLength(255)` on `name` (column is `varchar(255)`).
   - Spec updates for both error paths.

## Frontend changes

1. **New shared `TagActionPanel`** (extracted from `TagItem`)
   - Owns: `fetchTagById` query (form initial data, lazy),
     `updateTag` mutation **with `onError`** (message surfaced),
     delete flow with `deleteError`.
   - Renders: `TagActionGrid` (Edit / Delete), `TagForm`, delete confirm
     Dialog.
   - Props: `tag { id, name, description?, noteCount }`, `isOpen`, `onClose`,
     `onDeleted(tagId)`.
   - Invalidate `['tags']` + `['tag', id]` on success (the tree uses the same
     `['tags']` key, so it refreshes automatically).
   - Delete dialog copy: states the note count — "This tag is attached to N
     notes. They will keep everything else; the tag itself is removed."
2. **`TagItem`** — slimmed to row + ⋮ button + `<TagActionPanel>`
   (behavior unchanged, errors now visible).
3. **`CustomTagTreeItem`** — tag rows get a hover ⋮ `IconButton` (same
   pattern as note rows) opening the panel; `onDeleted` navigates to `/tags`
   when the deleted tag is the currently selected tag.
4. **`TagForm`** — accept an `error?: string | null` prop and render an
   `Alert` when set (update failures currently vanish).

## Commits (small, per user preference)

1. `tag: remove note associations when deleting a tag` — repository +
   delete-tag TS + specs (unit + integration)
2. `tag: validate name on tag update` — update-tag TS + DTO + specs
3. `tag-ui: extract shared tag action panel with error handling` —
   `TagActionPanel`, slimmed `TagItem`, `TagForm` error prop
4. `tag-tree: add edit/delete actions to tag rows` — `CustomTagTreeItem`

Commits 1–2 are backend, 3–4 frontend; each is independently shippable, but
the feature is only usable once 1 + 3 + 4 land (delete needs 1; the desktop
⋮ needs 4).

## Verification

- Backend: `npm run test`, `npm run test:integration`,
  `npm run test:architecture`, `npm run build`.
- Frontend: `npm run build` (tsc + vite).
- Manual smoke (dev servers + headless browser):
  - Desktop tree: ⋮ on a tag row → **Edit** → rename (+ description) → tree
    label updates without reload.
  - Rename to empty/whitespace → visible 400 error.
  - ⋮ → **Delete** on a tag with notes → confirm shows note count → tag gone
    from tree; the notes still carry their other tags (UI +
    `GET /api/tags/note/:id` cross-check).
  - Delete the currently open tag → returns to `/tags`.
  - Mobile list: Edit and Delete work from the flat list too.
