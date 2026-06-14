# Right Sidebar Button Clipping Fix

> **For Hermes:** Use direct implementation or subagent-driven-development skill to execute this plan.

**Goal:** Fix the clipping of toggle buttons at the top of the right sidebar by adding proper spacing below the TopRail.

**Architecture:** Add `padding-top` to the RightSidebar component to account for TopRail height (36px).

**Tech Stack:** React, CSS Modules, MUI ToggleButtonGroup

---

## Background

From bug ticket: `wiki-llm/projects/chronus/wiki/bugs/button-clipping-right-panel.md`

The [`TopRail`](../../components/TopRail/TopRail.tsx) component has a fixed height of 36px and `z-index: 10`. The [`RightSidebar`](../../pages/NotePage/components/RightSidebar/RightSidebar.tsx) contains a ToggleButtonGroup that sits at the top of the sidebar content area, causing it to be clipped by the TopRail.

## Root Cause

The RightSidebar is positioned within the layout flow but doesn't account for the TopRail height above it. The sidebar needs `padding-top` to push its content below the TopRail.

## Implementation

### Task 1: Add padding-top to RightSidebar

**Objective:** Add top padding to prevent button clipping

**Files:**
- Modify: `frontend/src/pages/NotePage/components/RightSidebar/RightSidebar.module.css`

**Step 1: Open the CSS module**

Read the file to confirm current styles:
```bash
cat frontend/src/pages/NotePage/components/RightSidebar/RightSidebar.module.css
```

**Step 2: Add padding-top to .sidebar class**

Current:
```css
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-paper);
  border-left: 1px solid var(--color-overlay-stronger);
  transition: width 0.2s ease, opacity 0.2s ease;
  flex: 0 0 auto;
}
```

Change to:
```css
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-paper);
  border-left: 1px solid var(--color-overlay-stronger);
  transition: width 0.2s ease, opacity 0.2s ease;
  flex: 0 0 auto;
  padding-top: 36px; /* Account for TopRail height */
}
```

**Step 3: Verify the change**

Read the file to confirm:
```bash
cat frontend/src/pages/NotePage/components/RightSidebar/RightSidebar.module.css
```

Expected: The `.sidebar` class now includes `padding-top: 36px;`

### Task 2: Test the Fix

**Objective:** Verify buttons are no longer clipped

**Step 1: Start the dev server**

```bash
cd frontend && npm run dev
```

**Step 2: Manual verification**

1. Navigate to a note page (e.g., `/notes/1`)
2. Ensure the right sidebar is open (click the sidebar toggle button if needed)
3. Observe the toggle buttons at the top (Checklist, Tags, Audio, Time icons)
4. **Expected:** Buttons are fully visible with proper spacing below the TopRail
5. **Verify:** No part of the buttons is hidden behind the TopRail

**Step 3: Test sidebar toggle**

1. Click the sidebar toggle button to close the sidebar
2. Click again to open it
3. **Expected:** Sidebar animation works smoothly, buttons remain properly positioned

**Step 4: Test different tabs**

1. Click each tab button (Checklist, Tags, Audio, Time)
2. **Expected:** All buttons remain fully visible when switching tabs

### Task 3: Commit the Change

**Step 1: Stage the modified file**

```bash
git add frontend/src/pages/NotePage/components/RightSidebar/RightSidebar.module.css
```

**Step 2: Commit with descriptive message**

```bash
git commit -m "fix: add padding to prevent right sidebar button clipping

The toggle buttons at the top of the right sidebar were being clipped
by the TopRail component (36px height). Added padding-top to the
sidebar to push content below the top bar.

Fixes: button-clipping-right-panel.md"
```

### Task 4: Update Bug Ticket

**Objective:** Mark the bug as resolved

**File:**
- Modify: `wiki-llm/projects/chronus/wiki/bugs/button-clipping-right-panel.md`

**Step 1: Update status to "completed"**

Change:
```yaml
status: open
```

To:
```yaml
status: completed
```

**Step 2: Add resolution section at bottom**

```markdown
## Resolution

**Fixed:** 2025-01-13

**Solution:** Added `padding-top: 36px` to `.sidebar` class in `RightSidebar.module.css` to account for TopRail height.

**Commit:** [SHA will be here after commit]
```

---

## Verification Checklist

- [ ] Buttons fully visible below TopRail
- [ ] No visual overlap or clipping
- [ ] Sidebar transitions still work
- [ ] Works on desktop (Note page)
- [ ] Change committed to git
- [ ] Bug ticket updated
