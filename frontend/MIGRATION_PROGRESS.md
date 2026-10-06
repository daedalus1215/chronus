# shadcn/Tailwind migration progress

Tracks the MUI → Tailwind v4 + shadcn/ui migration. See `frontend/CLAUDE.md`
styling section for interim rules while this is in flight.

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
- [ ] src/components/BottomSheet/BottomSheet.tsx
- [ ] src/components/DateRangePicker/DateRangePicker.tsx
- [ ] src/components/Header/Header.tsx
- [ ] src/components/Header/Sidebar/DesktopSidebar.tsx
- [ ] src/components/Header/Sidebar/MobileSidebar.tsx
- [ ] src/components/Header/Sidebar/navigation-items.tsx
- [ ] src/components/Header/Toolbar/Toolbar.tsx
- [ ] src/components/Layout/AuthenticatedLayout.tsx
- [ ] src/components/Layout/DesktopLayout.tsx
- [ ] src/components/Layout/ResizablePanel.tsx
- [ ] src/components/MoveNoteDialog/MoveNoteDialog.tsx
- [ ] src/components/PersistentAudioPlayer/PersistentAudioPlayer.tsx
- [ ] src/components/RightSheet/RightSheet.tsx
- [x] src/components/ThemeToggle/ThemeToggleButton.tsx
- [ ] src/components/TopRail/TopRail.tsx
- [ ] src/components/TreeNavigation/CustomTagTreeItem.tsx (MUI x-tree-view —
      no shadcn equivalent, needs a hand-rolled tree)
- [ ] src/components/TreeNavigation/TagTreeNavigation.tsx (same)

### ActivityPage

- [ ] src/pages/ActivityPage/ActivityPage.tsx
- [ ] src/pages/ActivityPage/components/ActivityScatterChart/ActivityScatterChart.tsx (MUI x-charts → Recharts)
- [ ] src/pages/ActivityPage/components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid.tsx (MUI x-data-grid → TanStack Table + shadcn table)
- [ ] src/pages/ActivityPage/components/DailyTimeTracksRadar/DailyTimeTracksRadar.tsx (MUI x-charts → Recharts)
- [ ] src/pages/ActivityPage/components/WeeklyTrendChart/WeeklyTrendChart.tsx (MUI x-charts → Recharts)

### ExplorerPage

- [ ] src/pages/ExplorerPage/ExplorerPage.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/DragGhostRow.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/ExplorerFilterBar.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeDialogs.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeHeader.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTreeMenus.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/ExplorerTree.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/FolderSubtree/FolderRow.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/FolderSubtree/FolderSubtree.tsx
- [ ] src/pages/ExplorerPage/components/ExplorerTree/NoteRow.tsx
- [ ] src/pages/ExplorerPage/components/FolderTree/FolderTreeItem.tsx
- [ ] src/pages/ExplorerPage/components/FolderTree/FolderTree.tsx
- [ ] src/pages/ExplorerPage/components/MergeNotesDialog/MergeNotesDialog.tsx
- [ ] src/pages/ExplorerPage/components/NotesBrowser/NotesBrowser.tsx

### HomePage

- [ ] src/pages/HomePage/HomePage.tsx
- [ ] src/pages/HomePage/components/ImportSelectionDialog/ImportSelectionDialog.tsx
- [ ] src/pages/HomePage/components/MergeSelectionDialog/MergeSelectionDialog.tsx
- [ ] src/pages/HomePage/components/NoteListView/DesktopNoteListView/DesktopNoteListView.tsx
- [ ] src/pages/HomePage/components/NoteListView/MobileNoteListVIew/MobileNoteListView.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/AudioHistoryView/AudioHistoryView.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/DateTimePicker/DateTimePicker.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/NoteActionGrid/NoteActionGrid.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/NoteItem.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm.tsx
- [ ] src/pages/HomePage/components/NoteListView/NoteItem/TimeTrackListView/TimeTrackListView.tsx
- [ ] src/pages/HomePage/components/NoteListView/SearchBar/SearchBar.tsx

### KanbanBoardPage

- [ ] src/pages/KanbanBoardPage/KanbanBoardPage.tsx
- [ ] src/pages/KanbanBoardPage/components/CardDetailsDialog/CardDetailsDialog.tsx
- [ ] src/pages/KanbanBoardPage/components/KanbanCard/KanbanCard.tsx
- [ ] src/pages/KanbanBoardPage/components/KanbanColumn/KanbanColumn.tsx
- [ ] src/pages/KanbanBoardPage/components/MobileKanbanBoard/MobileKanbanBoard.tsx

### Auth pages

- [ ] src/pages/LandingPage/LandingPage.tsx
- [ ] src/pages/LoginPage/LoginPage.tsx
- [ ] src/pages/LoginPage/components/Login.tsx
- [ ] src/pages/RegisterPage/RegisterPage.tsx
- [ ] src/pages/RegisterPage/components/Register.tsx

### NotePage

- [ ] src/pages/NotePage/NotePage.tsx
- [ ] src/pages/NotePage/components/AddTagForm/AddTagForm.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/AddCheckItemDialog/AddCheckItemDialog.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/CheckItemFilterBar/CheckItemFilterBar.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/DeleteCheckItemDialog/DeleteCheckItemDialog.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/DraggableCheckItem/DraggableCheckItem.tsx
- [ ] src/pages/NotePage/components/CheckListView/components/EditCheckItemDialog/EditCheckItemDialog.tsx
- [ ] src/pages/NotePage/components/CheckListView/DesktopCheckListView/DesktopCheckListView.tsx
- [ ] src/pages/NotePage/components/CheckListView/MobileCheckListView/MobileCheckListView.tsx
- [ ] src/pages/NotePage/components/MobileTagsView/MobileTagsView.tsx
- [ ] src/pages/NotePage/components/RightSidebar/RightSidebar.tsx
- [ ] src/pages/NotePage/components/SidebarAudioHistoryView/SidebarAudioHistoryView.tsx
- [ ] src/pages/NotePage/components/SidebarChecklistView/SidebarChecklistView.tsx
- [ ] src/pages/NotePage/components/SidebarFolderView/SidebarFolderView.tsx
- [ ] src/pages/NotePage/components/SidebarNoteHistoryView/SidebarNoteHistoryView.tsx
- [ ] src/pages/NotePage/components/SidebarTagsView/SidebarTagsView.tsx
- [ ] src/pages/NotePage/components/TimeTrackHistoryView/TimeTrackHistoryView.tsx
- [ ] src/pages/NotePage/components/TopRailActions/TopRailActions.tsx
- [ ] src/pages/NotePage/components/TranscriptionRecorder/TranscriptionRecorder.tsx

### SettingsPage

- [ ] src/pages/SettingsPage/SettingsPage.tsx
- [ ] src/pages/SettingsPage/components/AppearanceSettings/AppearanceSettings.tsx
- [ ] src/pages/SettingsPage/components/ChangePasswordForm/ChangePasswordForm.tsx
- [ ] src/pages/SettingsPage/components/ChangeUsernameForm/ChangeUsernameForm.tsx

### SearchPage

- [ ] src/pages/SearchPage/SearchPage.tsx

### TagPage

- [ ] src/pages/TagPage/TagPage.tsx
- [ ] src/pages/TagPage/components/TagListView/DesktopTagListView/DesktopTagListView.tsx
- [ ] src/pages/TagPage/components/TagListView/MobileTagListView/MobileTagListView.tsx
- [ ] src/pages/TagPage/components/TagListView/MobileTagNotesListView/MobileTagNotesListView.tsx
- [ ] src/pages/TagPage/components/TagListView/SearchBar/SearchBar.tsx
- [ ] src/pages/TagPage/components/TagListView/TagItem/TagActionGrid/TagActionGrid.tsx
- [ ] src/pages/TagPage/components/TagListView/TagItem/TagActionGrid/TagForm/TagForm.tsx
- [ ] src/pages/TagPage/components/TagListView/TagItem/TagActionPanel/TagActionPanel.tsx

### TimeEntryPage

- [ ] src/pages/TimeEntryPage/TimeEntryPage.tsx
- [ ] src/pages/TimeEntryPage/components/QuickAddRow/QuickAddRow.tsx
- [ ] src/pages/TimeEntryPage/components/SummaryStats/SummaryStats.tsx
- [ ] src/pages/TimeEntryPage/components/TimeEntryDataGrid/TimeEntryDataGrid.tsx (MUI x-data-grid → TanStack Table + shadcn table)

### YearlyNotesPage

- [ ] src/pages/YearlyNotesPage/YearlyNotesPage.tsx
- [ ] src/pages/YearlyNotesPage/components/YearlyNoteItem/YearlyNoteItem.tsx
- [ ] src/pages/YearlyNotesPage/components/YearlyNotesTimeline/YearlyNotesTimeline.tsx

## Final cleanup (only after every box above is checked)

- [ ] Remove `@mui/material`, `@mui/icons-material`, `@mui/styled-engine`,
      `@emotion/react`, `@emotion/styled` from package.json
- [ ] Remove `@mui/x-charts`, `@mui/x-data-grid`, `@mui/x-tree-view` once
      their replacements (Recharts / TanStack Table / hand-rolled tree)
      are in and verified
- [ ] Delete `src/theme.ts` and the `ThemeProvider`/`CssBaseline` wrapping
      in `src/App.tsx`
- [ ] Rewrite `frontend/CLAUDE.md` and `frontend/AGENTS.md` styling
      sections to describe the finished Tailwind + shadcn convention
