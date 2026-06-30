# Explorer Filter Spec

## Goal
Add a keyboard-activated, client-side text filter to the Explorer page that dims non-matching folders and notes while auto-expanding paths to matching items.

## Scope
- Frontend only — no backend changes
- Applies to the Explorer tree panel (`/explorer` route)
- Filters against folder names and note names (case-insensitive)

---

## User Story

As a Chronus user, I want to quickly narrow the Explorer tree to the notes or folders I care about by typing a filter, so I can find items without manually expanding and scrolling through the tree.

---

## Behavior

### Activation

- Press `Ctrl+K` (or `Cmd+K` on macOS) while focused anywhere on the Explorer page to toggle the filter bar
- The filter bar appears at the top of the Explorer tree panel, above the existing `ExplorerTreeHeader` actions row
- Pressing `Ctrl+K` again or pressing `Escape` clears the filter and hides the bar
- On mobile, the filter bar is always visible as a dedicated row above the tree (no keyboard shortcut needed)

### Filter Input

- A single-line text input with a magnifying-glass icon on the left and a clear (X) button on the right
- Placeholder text: "Filter folders and notes..."
- Minimum query length: 1 character (start filtering immediately — no 2-character minimum like the full-text search page)
- Debounced: 200ms (faster than the search page's 400ms since this is purely client-side)
- Case-insensitive substring match against folder `name` and note `name`

### Tree Behavior

- **Matching items** (folder or note name contains the query): rendered normally
- **Non-matching items**: rendered with reduced opacity (~30-40% dim) but remain in the tree — they are NOT removed from the DOM
- **Auto-expand**: any parent folder that contains a matching descendant (folder or note) is automatically expanded, even if the parent itself does not match
- If the filter is cleared, the tree returns to its previous expanded/collapsed state (we preserve the `expanded` set and restore it)

### Navigation

- Clicking a filtered result navigates exactly as it does today — no change
- The filter state persists across navigation within the Explorer (e.g., opening a note in the right pane)

### Keyboard

- `Ctrl+K` / `Cmd+K`: toggle filter bar
- `Escape`: clear filter and hide bar
- `Tab` from the filter input moves to the first tree item (standard focus management)

---

## UI Details

### Desktop filter bar

```
┌────────────────────────────────────────┐
│ 🔍 Filter folders and notes...    [X]  │  ← filter bar (Ctrl+K toggles)
├────────────────────────────────────────┤
│ [select] [drag] [new folder] [new memo]│  ← existing header actions
├────────────────────────────────────────┤
│ 📁 Project Alpha                       │
│   📝 Meeting notes                     │
│   📝 Design spec                       │
│ 📁 Personal                            │
│   📝 Grocery list                      │
│ 📝 Random thoughts                     │
└────────────────────────────────────────┘
```

### Mobile filter bar

Same input row, always visible at the top of the Explorer tree panel.

### Styling

- Filter bar: ~40px height, same background as the tree panel, subtle bottom border
- Input: inherits the dark theme text color, no outline on focus (use a subtle glow)
- Clear button: appears only when the filter has content
- Dimmed items: `opacity: 0.35` on the row container

---

## Implementation Approach

### 1. Filter state hook

New hook: `useExplorerFilter()` in `src/hooks/useExplorerFilter.ts`

```typescript
interface ExplorerFilterState {
  active: boolean;          // is the filter bar visible?
  query: string;            // current filter text
  setQuery: (q: string) => void;
  clear: () => void;        // reset query + hide bar
  toggle: () => void;       // show/hide bar
  matches: Set<number>;     // folder IDs that match or contain matches
  noteMatches: Set<number>; // note IDs that match
}
```

- Accepts `folders: FolderDto[]` and `notes: ExplorerNoteItem[]` as inputs
- Computes `matches` (folder IDs matching directly OR containing matching descendants) and `noteMatches` (note IDs matching directly)
- Debounces the query internally (200ms)

### 2. Auto-expand logic

When the filter is active and non-empty, merge the computed `matches` set into `expanded` so matching paths are open. Store the pre-filter `expanded` set so we can restore it on clear.

### 3. Integration into ExplorerTree

In `ExplorerTree.tsx`:

- Add `useExplorerFilter(folders, notes)` 
- Pass `filterState` down through the component tree
- In `FolderRow` and `NoteRow`, apply `opacity: filterActive && !isMatch ? 0.35 : 1`
- Auto-merge `filterState.matches` into the `expanded` state

### 4. Filter bar component

New component: `ExplorerFilterBar.tsx` in `src/pages/ExplorerPage/components/ExplorerTree/`

- Renders the text input with search icon and clear button
- Controlled by `filterState.query` and `filterState.setQuery`
- Only visible when `filterState.active` is true (desktop) or always (mobile via `useIsMobile()`)

### 5. Keyboard shortcut

Register a `keydown` listener in `ExplorerTree` (or a dedicated hook) for `Ctrl+K` / `Cmd+K` → calls `filterState.toggle()`

### 6. CSS

Add styles to `ExplorerTree.module.css`:
- `.filterBar` — the bar container
- `.filterInput` — the text field
- `.filterIcon` — search icon
- `.filterClear` — clear button
- `.dimmed` — reduced opacity class for non-matching items

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useExplorerFilter.ts` | Filter state + matching logic |
| `src/pages/ExplorerPage/components/ExplorerTree/ExplorerFilterBar.tsx` | Filter input bar component |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/ExplorerPage/components/ExplorerTree/ExplorerTree.tsx` | Wire filter hook, pass state down, add keyboard listener |
| `src/pages/ExplorerPage/components/ExplorerTree/FolderSubtree/FolderRow.tsx` | Apply dimmed style when not matching |
| `src/pages/ExplorerPage/components/ExplorerTree/NoteRow.tsx` | Apply dimmed style when not matching |
| `src/pages/ExplorerPage/components/ExplorerTree/ExplorerTree.module.css` | Add filter bar + dimmed styles |
| `src/pages/ExplorerPage/ExplorerPage.tsx` | Show filter bar on mobile layout |

---

## Edge Cases

- **Empty tree**: filter bar renders but has no effect (no crash)
- **All items match**: tree renders normally, no dimming
- **No items match**: all items dimmed, tree still navigable
- **Very deep nesting**: auto-expand works through arbitrary depth
- **Filter while renaming**: if inline rename is active, filter activation cancels the rename
- **Filter while dragging**: filter toggle is disabled during active drag
- **Concurrent data refresh** (e.g., note created from header button): filter recomputes against fresh data

---

## Not In Scope (Future)

- Backend-powered filtering (e.g., by date, tag, or content)
- Filter by note type (memo vs. checklist)
- Saved filter presets
- Highlighting the matching substring within the name (e.g., bold or colored)
