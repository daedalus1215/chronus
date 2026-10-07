# shadcn/Tailwind migration progress

Tracks the MUI → Tailwind v4 + shadcn/ui migration. See the Styling rules section of `frontend/AGENTS.md` for interim rules while this is in flight.

## Done

- [x] Toolchain: Tailwind v4 + `@tailwindcss/vite`, token mapping in
      `src/styles/tailwind.css` (reuses existing `global.scss` CSS vars)
- [x] Core shadcn primitives generated in `src/components/ui/`
- [x] `TooltipProvider` + `Toaster` mounted in `App.tsx`

## Not yet migrated (still importing `@mui`)

One checkbox per file from `grep -rl '@mui' src --include=*.tsx`. Check off
as each is converted to Tailwind + shadcn primitives and its MUI import is
gone. Group commits by directory/feature, not necessarily one file each.

### components/ (shared)

- [ ] src/App.tsx (ThemeProvider/CssBaseline — stays until the last MUI
      consumer is gone)
- [x] src/components/BottomSheet/BottomSheet.tsx
- [x] src/components/DateRangePicker/DateRangePicker.tsx
- [x] src/components/Header/Header.tsx
- [x] src/components/Header/Sidebar/DesktopSidebar.tsx
- [x] src/components/Header/Sidebar/MobileSidebar.tsx
- [x] src/components/Header/Sidebar/navigation-items.tsx
- [x] src/components/Header/Toolbar/Toolbar.tsx
- [x] src/components/Layout/AuthenticatedLayout.tsx
- [x] src/components/Layout/DesktopLayout.tsx (dead code — unused anywhere;
      migrated anyway for consistency rather than deleting out-of-scope)
- [x] src/components/Layout/ResizablePanel.tsx
- [x] src/components/MoveNoteDialog/MoveNoteDialog.tsx
- [x] src/components/PersistentAudioPlayer/PersistentAudioPlayer.tsx
- [x] src/components/RightSheet/RightSheet.tsx
- [x] src/components/ThemeToggle/ThemeToggleButton.tsx
- [x] src/components/TopRail/TopRail.tsx
- [x] src/components/TreeNavigation/CustomTagTreeItem.tsx (hand-rolled tree;
      see commit for the keyboard-nav caveat)
- [x] src/components/TreeNavigation/TagTreeNavigation.tsx (same)

### ActivityPage

- [x] src/pages/ActivityPage/ActivityPage.tsx
- [x] src/pages/ActivityPage/components/ActivityScatterChart/ActivityScatterChart.tsx (was already hand-rolled SVG, not x-charts — just MUI chrome removed)
- [x] src/pages/ActivityPage/components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid.tsx (hand-rolled table + sort + pagination)
- [x] src/pages/ActivityPage/components/DailyTimeTracksRadar/DailyTimeTracksRadar.tsx (MUI x-charts → Recharts)
- [x] src/pages/ActivityPage/components/WeeklyTrendChart/WeeklyTrendChart.tsx (MUI x-charts → Recharts)

### ExplorerPage

- [x] src/pages/ExplorerPage/ExplorerPage.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/DragGhostRow.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/ExplorerFilterBar.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeDialogs.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeHeader.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeMenus.tsx (deleted — folded into FolderRow/NoteRow)
- [x] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTree.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/FolderSubtree/FolderRow.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/FolderSubtree/FolderSubtree.tsx
- [x] src/pages/ExplorerPage/components/ExplorerTree/NoteRow.tsx
- [x] src/pages/ExplorerPage/components/FolderTree/FolderTreeItem.tsx
- [x] src/pages/ExplorerPage/components/FolderTree/FolderTree.tsx
- [x] src/pages/ExplorerPage/components/MergeNotesDialog/MergeNotesDialog.tsx
- [x] src/pages/ExplorerPage/components/NotesBrowser/NotesBrowser.tsx

### HomePage

- [x] src/pages/HomePage/HomePage.tsx
- [x] src/pages/HomePage/components/ImportSelectionDialog/ImportSelectionDialog.tsx
- [x] src/pages/HomePage/components/MergeSelectionDialog/MergeSelectionDialog.tsx
- [x] src/pages/HomePage/components/NoteListView/DesktopNoteListView/DesktopNoteListView.tsx
- [x] src/pages/HomePage/components/NoteListView/MobileNoteListVIew/MobileNoteListView.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/AudioHistoryView/AudioHistoryView.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/DateTimePicker/DateTimePicker.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/NoteActionGrid/NoteActionGrid.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/NoteItem.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm.tsx
- [x] src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackListView/TimeTrackListView.tsx
- [x] src/pages/HomePage/components/NoteListView/SearchBar/SearchBar.tsx

### KanbanBoardPage

- [x] src/pages/KanbanBoardPage/KanbanBoardPage.tsx
- [x] src/pages/KanbanBoardPage/components/CardDetailsDialog/CardDetailsDialog.tsx
- [x] src/pages/KanbanBoardPage/components/KanbanCard/KanbanCard.tsx
- [x] src/pages/KanbanBoardPage/components/KanbanColumn/KanbanColumn.tsx
- [x] src/pages/KanbanBoardPage/components/MobileKanbanBoard/MobileKanbanBoard.tsx

### Auth pages

- [x] src/pages/LandingPage/LandingPage.tsx
- [x] src/pages/LoginPage/LoginPage.tsx
- [x] src/pages/LoginPage/components/Login.tsx
- [x] src/pages/RegisterPage/RegisterPage.tsx
- [x] src/pages/RegisterPage/components/Register.tsx

### NotePage

- [ ] src/pages/NotePage/NotePage.tsx
- [ ] src/pages/NotePage/components/AddTagForm/AddTagForm.tsx
- [x] src/pages/NotePage/components/CheckListView/components/AddCheckItemDialog/AddCheckItemDialog.tsx
- [x] src/pages/NotePage/components/CheckListView/components/CheckItemFilterBar/CheckItemFilterBar.tsx
- [x] src/pages/NotePage/components/CheckListView/components/DeleteCheckItemDialog/DeleteCheckItemDialog.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/DraggableCheckItem/DraggableCheckItem.tsx
- [x] src/pages/NotePage/components/CheckListView/components/EditCheckItemDialog/EditCheckItemDialog.tsx
- [ ] src/pages/NotePage/components/CheckListView/DesktopCheckListView/DesktopCheckListView.tsx
- [ ] src/pages/NotePage/components/CheckListView/MobileCheckListView/MobileCheckListView.tsx
- [x] src/pages/NotePage/components/MobileTagsView/MobileTagsView.tsx
- [x] src/pages/NotePage/components/RightSidebar/RightSidebar.tsx
- [x] src/pages/NotePage/components/SidebarAudioHistoryView/SidebarAudioHistoryView.tsx
- [ ] src/pages/NotePage/components/SidebarChecklistView/SidebarChecklistView.tsx
- [x] src/pages/NotePage/components/SidebarFolderView/SidebarFolderView.tsx
- [x] src/pages/NotePage/components/SidebarNoteHistoryView/SidebarNoteHistoryView.tsx
- [x] src/pages/NotePage/components/SidebarTagsView/SidebarTagsView.tsx
- [ ] src/pages/NotePage/components/TimeTrackHistoryView/TimeTrackHistoryView.tsx
- [x] src/pages/NotePage/components/TopRailActions/TopRailActions.tsx
- [x] src/pages/NotePage/components/TranscriptionRecorder/TranscriptionRecorder.tsx

### SettingsPage

- [x] src/pages/SettingsPage/SettingsPage.tsx
- [x] src/pages/SettingsPage/components/AppearanceSettings/AppearanceSettings.tsx
- [x] src/pages/SettingsPage/components/ChangePasswordForm/ChangePasswordForm.tsx
- [x] src/pages/SettingsPage/components/ChangeUsernameForm/ChangeUsernameForm.tsx

### SearchPage

- [x] src/pages/SearchPage/SearchPage.tsx

### TagPage

- [x] src/pages/TagPage/TagPage.tsx
- [x] src/pages/TagPage/components/TagListView/DesktopTagListView/DesktopTagListView.tsx
- [x] src/pages/TagPage/components/TagListView/MobileTagListView/MobileTagListView.tsx
- [x] src/pages/TagPage/components/TagListView/MobileTagNotesListView/MobileTagNotesListView.tsx
- [x] src/pages/TagPage/components/TagListView/SearchBar/SearchBar.tsx
- [x] src/pages/TagPage/components/TagListView/TagItem/TagActionGrid/TagActionGrid.tsx
- [x] src/pages/TagPage/components/TagListView/TagItem/TagActionGrid/TagForm/TagForm.tsx
- [x] src/pages/TagPage/components/TagListView/TagItem/TagActionPanel/TagActionPanel.tsx

### TimeEntryPage

- [x] src/pages/TimeEntryPage/TimeEntryPage.tsx
- [x] src/pages/TimeEntryPage/components/QuickAddRow/QuickAddRow.tsx
- [x] src/pages/TimeEntryPage/components/SummaryStats/SummaryStats.tsx
- [x] src/pages/TimeEntryPage/components/TimeEntryDataGrid/TimeEntryDataGrid.tsx (hand-rolled table + pagination instead — see commit)

### YearlyNotesPage

- [x] src/pages/YearlyNotesPage/YearlyNotesPage.tsx
- [x] src/pages/YearlyNotesPage/components/YearlyNoteItem/YearlyNoteItem.tsx
- [x] src/pages/YearlyNotesPage/components/YearlyNotesTimeline/YearlyNotesTimeline.tsx

## Final cleanup (only after every box above is checked)

- [ ] Remove `@mui/material`, `@mui/icons-material`, `@mui/styled-engine`,
      `@emotion/react`, `@emotion/styled` from package.json
- [ ] Remove `@mui/x-charts`, `@mui/x-data-grid`, `@mui/x-tree-view` once
      their replacements (Recharts / TanStack Table / hand-rolled tree)
      are in and verified
- [ ] Delete `src/theme.ts` and the `ThemeProvider`/`CssBaseline` wrapping
      in `src/App.tsx`
- [ ] Rewrite the `frontend/AGENTS.md` styling sections to describe the
      finished Tailwind + shadcn convention
