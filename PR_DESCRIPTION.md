# Premium UI makeover + Explorer & Activity functional fixes

This branch delivers a "sleek & premium" (Linear/Vercel-style) visual makeover of the Chronus frontend, and along the way fixes several functional bugs uncovered in the Explorer and Activity Page. **20 commits · 53 files · +1321/−375.** Frontend work was verified against the live authenticated app (headless Chromium + real JWT); backend/behavioral changes were verified end-to-end and keep the suite green (67 tests).

## 1. Premium UI makeover

A shared dark design system (`global.scss` + `theme.ts`): one indigo→violet accent, glass surfaces, layered elevation, spring motion, ambient background glows.

- **Design system + MUI theme** — gradient buttons/FABs, glass menus/popovers/dialogs, accent focus rings.
- **Header, desktop + mobile sidebars** — glass, gradient active-nav.
- **Home** — ambient particle field, staggered create-menu, FAB +→× morph.
- **Explorer tree** — accent rows, rotating chevrons, glass panel, glowing empty state.
- **Tag list, note cards, activity dashboard cards & stat tiles.**
- **Kanban board** — glass columns with status-accent lines + count pills, cards with status left-bar + hover lift, gradient header + done-progress pill.
- **Note editor & markdown read view (desktop + mobile)** — capped reading measure (~780–820px), glass code blocks, rounded accent-headed tables, accent-gradient blockquotes, accent links, glass editor textarea with accent focus glow.
- Swept undefined `var(--x)` tokens across tag/note pages.

## 2. Explorer filter bug fixes (from PR #152 review)

- **`Ctrl+.` fired globally** → scoped to the tree panel via `treeRef.contains(document.activeElement)` (panel is `tabIndex={-1}` so clicking a row focuses it). No longer toggles the filter from the note editor pane.
- **Escape double-fire** → the filter's Escape and the tree's selection/pick-mode Escape were two independent `window` listeners that both ran. Consolidated into one priority-ordered handler (filter → pick-items → selection). _(The reviewer's suggested `stopPropagation()` wouldn't have worked — both listeners were on `window`.)_
- **Wasted match computation** while the filter is inactive → short-circuited.

Verified with scripted keyboard events: `Ctrl+.` inert from the note pane, one Escape clears only the filter while preserving an active selection.

## 3. Activity Page — make it solid & functional

The Activity Page had several real bugs:

- **Streak endpoint returned 404** — `GetStreakAction` existed but was never registered in the module's `controllers`; the page silently fell back to a streak of 0. Registered it.
- **Most-active note 500'd** on empty weeks — dereferenced a null result and assumed the note lookup returned a row. Guarded both (`?.[0]?.name ?? 'Unknown'`).
- **UTC/local date mismatch** — `getWeeklyTrend`/`getCurrentStreak` built date windows with `toISOString()` (UTC) while tracks are stored as local dates; for users behind UTC this shifted the 7-day window. Now uses the local `getDateString` helper consistently.
- **All-zero week rendered a blank chart** — the trend API always returns 7 days, so the empty check never fired. Treat `weeklyTotal === 0` as the empty state.
- **Date picker only drove the daily cards** — Weekly Trend, Most Active, and Streak were hardcoded to a window ending *today*, so selecting a past date with activity still showed "No activity." Threaded an optional `date` param through each endpoint (action → service → transaction script → repository, default today) and wired the picker's `selectedDate`. The whole page now reflects the selected date.

Verified end-to-end: selecting 2026-03-12 shows the correct March trend (3h 35m), most-active ("March sprint", 215m), and a 4-day streak; the default (today) view and empty states render correctly.

## Notes for reviewers

- Branch name (`style-change`) predates the functional fixes — it's a mixed makeover + fixes PR.
- No schema/migration changes. Backend changes are additive (optional query params, module registration, null guards).
- Known minor follow-ups (not addressed here): the daily-card labels still say "today" when a past date is selected; the Activity radar degenerates visually with 1–2 notes; deleting a note does not cascade-delete its time-tracks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
