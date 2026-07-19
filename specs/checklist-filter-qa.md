# Q&A: Checklist Item Filtering Feature

**Date:** 2026-07-19
**Feature:** Filter check items within a single note (checklist mode, not memo)
**Use case:** Grocery list with 50+ items — need to filter down to find what you're looking for

---

## Question 1: Filter Criteria — What fields should be searchable?

**Context:** CheckItem entity has: `name` (string), `status` (ready|in_progress|review|done), `doneDate` (null=active), `description` (nullable text)

**Options:**
- [x] **Name text search** — "milk" matches "Whole Milk, 1 gallon" (obvious for grocery lists)
- [ ] **Status filter** — dropdown to show only "ready", "in_progress", "review", or "done" items
- [ ] **Done/Undone toggle** — checkbox to show only unchecked items (essentially doneDate IS NULL)
- [ ] **Description search** — search inside item descriptions (most check items probably don't have descriptions)

**Why I'm asking:** A grocery list filter is primarily text-based ("find 'eggs' in my list of 80 items"). Status filtering is more relevant for project management checklists. Don't want to build unused UI.

---

## Question 2: Filter UI — Where does the filter bar live?

**Context:** Current NotePage renders `DesktopCheckListView` / `MobileCheckListView` inside a Paper container with a flex-column layout. Items scroll inside a `<List>` component.

**Options:**
- **A. Top of the checklist** — Filter bar sits above the item list, inside the Paper container. Always visible, items scroll below it. (Most common pattern — Linear, Notion, Todoist)
- **B. Floating search** — A search icon/FAB that expands into a filter input when clicked. Saves vertical space.
- **C. Sidebar filter** — Filter controls in the right sidebar tab alongside checklist/tags/audio/time tabs.

**Why I'm asking:** Option A is the most discoverable and fastest for the grocery list use case. Option B saves space but adds a click. Option C is cleaner but requires sidebar to be open.

**Answer**: Let's go with Option A.
---

## Question 3: Filter Behavior — Real-time or explicit submit?

**Context:** User types "eggs" and expects results to appear.

**Options:**
- **A. Real-time with debounce** — Results update as you type (300ms debounce). Most responsive, no mental model of "submit."
- **B. Enter to search** — Type filter, press Enter to apply. Explicit control, fewer unnecessary re-renders.
- **C. Both** — Real-time preview with Enter to "lock in" the filter.

**Why I'm asking:** For 50-100 items, client-side real-time filtering is instant and feels great. If we go server-side, debounce is critical to avoid hammering the API.

**Answer**: I think we can do client-side real-time filtering. If we still want to debounce - even if we are doing client-side - I am not going to stress it.

---

## Question 4: Client-side vs Server-side filtering?

**Context:** Currently, `GET /check-items/notes/:noteId` returns ALL items for a note. A grocery list might have 50-100 items.

**Options:**
- **A. Client-side only** — Fetch all items once, filter in the browser. Fastest UX, zero backend changes, works offline. Only practical for lists < ~500 items.
- **B. Server-side only** — Send filter params to API, backend returns filtered results. Scales to millions, but adds latency and requires backend changes.
- **C. Hybrid** — Client filters the cached dataset for instant feedback. Server-side filter available as a fallback for very large lists.

**Why I'm asking:** For a personal grocery list of 50-100 items, client-side is the right call. It's instant, requires zero backend changes, and works offline. Server-side filtering is overengineering unless you expect notes with 1000+ items.

**Answer**: Option A is the desire.
---

## Question 5: Done items — How should completed items behave?

**Context:** Currently, the transaction script splits items: active items first, then done items appended at the bottom.

**Options:**
- **A. Default: show all** — Filter applies to both active and done items. User can add a "done/undone" toggle if they want.
- **B. Default: hide done** — By default, only show active (undone) items. Show a "include done" toggle to reveal completed items.
- **C. Collapsed done section** — Done items exist in a collapsed section below active items (current behavior). Filter only applies to the visible section.

**Why I'm asking:** In a grocery list, you mostly care about what you HAVEN'T bought yet. Hiding done items by default reduces noise. But sometimes you want to see what you already bought to avoid duplicates.

**Answer**: Let's go with A. The reason being, is this is the point of the feature. I want to uncheck prior grocery run items. I just want to do a search, uncheck, then search for next one. It will save me scrolling.

---

## Question 6: Multi-filter combinations?

**Context:** User types "milk" AND wants to see only "in_progress" status items.

**Options:**
- **A. Text search only** — Simple text input. No combo filters. Keep it dead simple.
- **B. Text + status dropdown** — Text search combined with status filter. AND logic (both must match).
- **C. Text + status + done toggle** — Full filter bar with all three controls.

**Why I'm asking:** A grocery list doesn't need status filtering. A project management checklist does. What's the primary use case?

**Answer**: Since we are doing sidebar flow, then we can do Option B comfortably. But I want the default to be to include all statuses. Only if I want to use the filter, should it be involved.
---

## Question 7: Filter persistence?

**Context:** User filters to "milk", navigates away to another note, then comes back.

**Options:**
- **A. No persistence** — Filter clears when you leave the note. Each visit starts fresh.
- **B. Per-note persistence** — Filter state saved in localStorage per noteId. Come back to "Grocery List" and "milk" is still filtered.
- **C. Session-only** — Filter persists while browsing notes, clears on page reload.

**Why I'm asking:** For a grocery list you visit multiple times per shopping trip, persistence is nice. For occasional checklists, it's noise.

**Answer**: No persistence.
---

## Question 8: Clear filter UX?

**Context:** User has typed "eggs" and wants to see all items again.

**Options:**
- **A. X button in input** — Standard clear button inside the search field.
- **B. Keyboard shortcut** — Escape clears the filter.
- **C. Both** — X button + Escape key.

**Why I'm asking:** C is the standard pattern and costs nothing extra.

**Answer**: X button in input

---

## Question 9: Mobile behavior?

**Context:** MobileCheckListView has the same structure but constrained width.

**Options:**
- **A. Same filter bar** — Filter bar appears at top on mobile too.
- **B. Compact on mobile** — Smaller filter input, maybe icon-triggered to save space.
- **C. Bottom sheet** — Tap filter icon, bottom sheet slides up with filter controls.

**Why I'm asking:** Mobile grocery list usage is high (in the store). The filter needs to be thumb-friendly and not waste precious screen real estate.

**Answer**: Option B

---

## Question 10: Visual feedback — What happens when no items match?

**Context:** User types "xyz" and nothing matches.

**Options:**
- **A. Empty state message** — "No items match 'xyz'" with a suggestion to clear the filter.
- **B. Silent empty list** — Just show nothing. User figures it out.
- **C. Count badge** — Show "3 of 47 items match" next to the filter bar.

**Why I'm asking:** A count badge (Option C) is the most informative — you know immediately if your filter is too narrow. Combined with an empty state message, it's the best UX.

**Answer**: Option A.
---

## Summary Table (fill in your choices)

| # | Question | Your Choice | Notes |
|---|----------|-------------|-------|
| 1 | Filter criteria | | |
| 2 | Filter UI location | | |
| 3 | Real-time vs submit | | |
| 4 | Client vs server | | |
| 5 | Done items behavior | | |
| 6 | Multi-filter combos | | |
| 7 | Filter persistence | | |
| 8 | Clear filter UX | | |
| 9 | Mobile behavior | | |
| 10 | No-match feedback | | |
