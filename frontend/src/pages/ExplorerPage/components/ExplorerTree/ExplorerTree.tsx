import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExplorerTreeDialogs } from './ExplorerTreeDialogs';
import { ExplorerTreeHeader } from './ExplorerTreeHeader';
import { ExplorerTreeMenus } from './ExplorerTreeMenus';
import { FolderSubtree } from './FolderSubtree/FolderSubtree';
import { NoteRow } from './NoteRow';
import { DragGhostRow } from './DragGhostRow';
import { useFolderOperations } from './useFolderOperations';
import { useDragOperations } from './useDragOperations';
import { useExplorerFilter, useMergedExpanded } from './useExplorerFilter';
import { ExplorerFilterBar } from './ExplorerFilterBar';
import styles from './ExplorerTree.module.css';

export type DragMode = 'off' | 'on';

export const ExplorerTree: React.FC = () => {
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams<{ id: string }>();

  // Menu state
  const [folderMenu, setFolderMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);
  const [noteMenu, setNoteMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);

  // Selection state
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [folderRangeAnchorId, setFolderRangeAnchorId] = useState<number | null>(null);
  const [pickItemsMode, setPickItemsMode] = useState(false);

  // Drag mode state
  const [dragMode, setDragMode] = useState<DragMode>('off');

  const cycleDragMode = useCallback(() => {
    setDragMode(prev => prev === 'off' ? 'on' : 'off');
    setPickItemsMode(false);
    setSelectedFolderIds(new Set());
    setSelectedNoteIds(new Set());
    setFolderRangeAnchorId(null);
  }, []);

  // Folder operations hook (data, dialogs, CRUD)
  const {
    folders,
    setFolders,
    notes,
    setNotes,
    loading,
    tree,
    visibleFolderIds,
    newFolderParentId,
    setNewFolderParentId,
    deleteConfirmId,
    setDeleteConfirmId,
    renaming,
    renameValue,
    renameRef,
    setRenameValue,
    startRename,
    commitRename,
    cancelRename,
    expanded,
    toggle,
    reparentTarget,
    setReparentTarget,
    disabledMoveDestFolderIds,
    handleCreateMemo,
    handleCreateMemoInFolder,
    handleCreateFolder,
    handleDeleteFolder,
    handleReparentConfirm,
  } = useFolderOperations(selectedFolderIds);

  // Filter hook
  const filter = useExplorerFilter(tree, notes);
  const mergedExpanded = useMergedExpanded(expanded, filter.folderMatches, filter.active);

  // Pause/resume rename when filter activates/deactivates
  const pausedRenameRef = useRef<{ id: number; value: string } | null>(null);
  useEffect(() => {
    if (filter.active && renaming !== null) {
      pausedRenameRef.current = { id: renaming, value: renameValue };
      cancelRename();
    } else if (!filter.active && pausedRenameRef.current) {
      const { id, value } = pausedRenameRef.current;
      startRename(id, value);
      pausedRenameRef.current = null;
    }
  }, [filter.active, renaming, renameValue, cancelRename, startRename]);

  // Drag operations
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { activeId, dropIntent, onDragStart, onDragCancel, onDragMove, onDragEnd } = useDragOperations({
    folders,
    notes,
    setFolders,
    setNotes,
  });

  // Selection helpers
  const clearSelection = useCallback(() => {
    setSelectedFolderIds(new Set());
    setSelectedNoteIds(new Set());
    setFolderRangeAnchorId(null);
  }, []);

  const exitPickItemsMode = useCallback(() => {
    setPickItemsMode(false);
    clearSelection();
  }, [clearSelection]);

  const toggleFolderInSelection = useCallback((folderId: number) => {
    setSelectedFolderIds(prev => {
      const n = new Set(prev);
      if (n.has(folderId)) n.delete(folderId);
      else n.add(folderId);
      return n;
    });
    setFolderRangeAnchorId(folderId);
  }, []);

  const toggleNoteInSelection = useCallback((noteId: number) => {
    setSelectedNoteIds(prev => {
      const n = new Set(prev);
      if (n.has(noteId)) n.delete(noteId);
      else n.add(noteId);
      return n;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickItemsMode) exitPickItemsMode();
        else clearSelection();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        const n = selectedFolderIds.size + selectedNoteIds.size;
        if (n >= 1) {
          e.preventDefault();
          setReparentTarget({
            folderIds: [...selectedFolderIds],
            noteIds: [...selectedNoteIds],
          });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearSelection, exitPickItemsMode, pickItemsMode, selectedFolderIds, selectedNoteIds, setReparentTarget]);

  // Click handlers
  const handleFolderRowClick = useCallback(
    (e: React.MouseEvent, folderId: number) => {
      e.stopPropagation();
      if (pickItemsMode && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        toggleFolderInSelection(folderId);
        return;
      }
      if (e.shiftKey && folderRangeAnchorId !== null) {
        const order = visibleFolderIds;
        const i0 = order.indexOf(folderRangeAnchorId);
        const i1 = order.indexOf(folderId);
        if (i0 === -1 || i1 === -1) {
          setSelectedFolderIds(new Set([folderId]));
        } else {
          const a = Math.min(i0, i1);
          const b = Math.max(i0, i1);
          setSelectedFolderIds(new Set(order.slice(a, b + 1)));
        }
        setSelectedNoteIds(new Set());
      } else if (e.ctrlKey || e.metaKey) {
        setSelectedFolderIds(prev => {
          const n = new Set(prev);
          if (n.has(folderId)) n.delete(folderId);
          else n.add(folderId);
          return n;
        });
        setFolderRangeAnchorId(folderId);
        setSelectedNoteIds(new Set());
      } else {
        setSelectedFolderIds(new Set([folderId]));
        setFolderRangeAnchorId(folderId);
        setSelectedNoteIds(new Set());
        toggle(folderId);
      }
    },
    [folderRangeAnchorId, pickItemsMode, toggle, toggleFolderInSelection, visibleFolderIds]
  );

  const handleNoteRowClick = useCallback(
    (e: React.MouseEvent, noteId: number, openNote: () => void) => {
      if (pickItemsMode && !e.ctrlKey && !e.metaKey) {
        if (e.detail === 2) {
          openNote();
          return;
        }
        toggleNoteInSelection(noteId);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedNoteIds(prev => {
          const n = new Set(prev);
          if (n.has(noteId)) n.delete(noteId);
          else n.add(noteId);
          return n;
        });
        setSelectedFolderIds(new Set());
        return;
      }
      setSelectedNoteIds(new Set());
      setSelectedFolderIds(new Set());
      openNote();
    },
    [pickItemsMode, toggleNoteInSelection]
  );

  const selectionCount = selectedFolderIds.size + selectedNoteIds.size;

  // Loading state
  if (loading) {
    return (
      <Box className={styles.loading}>
        <CircularProgress size={18} thickness={3} />
      </Box>
    );
  }

  const rootNotes = notes.filter(n => n.folderId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const rootSortableItems = [
    ...tree.map(n => `folder-${n.id}`),
    ...rootNotes.map(n => `note-${n.id}`),
  ];

  return (
    <Box className={styles.tree}>
      <ExplorerTreeHeader
        selectionCount={selectionCount}
        pickItemsMode={pickItemsMode}
        dragMode={dragMode}
        onMoveSelected={() =>
          setReparentTarget({
            folderIds: [...selectedFolderIds],
            noteIds: [...selectedNoteIds],
          })
        }
        onClearSelection={clearSelection}
        onTogglePickItems={() => {
          if (pickItemsMode) exitPickItemsMode();
          else {
            setPickItemsMode(true);
            setDragMode('off');
          }
        }}
        onCycleDragMode={cycleDragMode}
        onNewFolder={() => setNewFolderParentId(null)}
        onNewMemo={handleCreateMemo}
        onToggleFilter={filter.toggle}
      />

      {/* Filter bar */}
      {filter.active && (
        <ExplorerFilterBar
          query={filter.query}
          setQuery={filter.setQuery}
          onClear={filter.clear}
        />
      )}

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <Box className={styles.body}>
          <SortableContext items={rootSortableItems} strategy={verticalListSortingStrategy}>
            {tree.map(node => (
              <FolderSubtree
                key={node.id}
                node={node}
                depth={0}
                notes={notes}
                expanded={mergedExpanded}
                activeNoteId={activeNoteId}
                renaming={renaming}
                renameValue={renameValue}
                renameRef={renameRef}
                onRenameChange={setRenameValue}
                onRenameCommit={commitRename}
                onRenameCancel={cancelRename}
                onFolderMenu={(anchor, id) => setFolderMenu({ anchor, id })}
                onFolderRowClick={handleFolderRowClick}
                onChevronClick={toggle}
                onNoteOpen={id => navigate(`notes/${id}`)}
                onNoteMenu={(anchor, id) => setNoteMenu({ anchor, id })}
                onNewSubfolder={id => setNewFolderParentId(id)}
                selectedFolderIds={selectedFolderIds}
                selectedNoteIds={selectedNoteIds}
                onNoteRowClick={handleNoteRowClick}
                pickItemsMode={pickItemsMode}
                dragMode={dragMode}
                dropIntent={dropIntent}
                toggleFolderInSelection={toggleFolderInSelection}
                toggleNoteInSelection={toggleNoteInSelection}
                folderMatches={filter.folderMatches}
                noteMatches={filter.noteMatches}
                filterActive={filter.active}
              />
            ))}

            {rootNotes.map(note => (
              <NoteRow
                key={note.id}
                note={note}
                depth={0}
                active={activeNoteId === String(note.id)}
                selected={selectedNoteIds.has(note.id)}
                pickItemsMode={pickItemsMode}
                dragMode={dragMode}
                onOpen={id => navigate(`notes/${id}`)}
                onRowClick={handleNoteRowClick}
                onMenuOpen={(anchor, id) => setNoteMenu({ anchor, id })}
                onTogglePick={() => toggleNoteInSelection(note.id)}
                isMatch={filter.noteMatches.has(note.id)}
                filterActive={filter.active}
              />
            ))}
          </SortableContext>

          {rootNotes.length === 0 && tree.length === 0 && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No notes or folders yet</Typography>
            </Box>
          )}
        </Box>

        <DragOverlay>
          {activeId ? <DragGhostRow id={activeId} folders={folders} notes={notes} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Dialogs */}
      <ExplorerTreeDialogs
        newFolderParentId={newFolderParentId}
        setNewFolderParentId={setNewFolderParentId}
        handleCreateFolder={handleCreateFolder}
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        handleDeleteFolder={handleDeleteFolder}
        reparentTarget={reparentTarget}
        setReparentTarget={setReparentTarget}
        handleReparentConfirm={handleReparentConfirm}
        disabledMoveDestFolderIds={disabledMoveDestFolderIds}
      />

      {/* Context menus */}
      <ExplorerTreeMenus
        folderMenu={folderMenu}
        setFolderMenu={setFolderMenu}
        folders={folders}
        startRename={startRename}
        setReparentTarget={setReparentTarget}
        setNewFolderParentId={setNewFolderParentId}
        setDeleteConfirmId={setDeleteConfirmId}
        onCreateMemoInFolder={handleCreateMemoInFolder}
        noteMenu={noteMenu}
        setNoteMenu={setNoteMenu}
      />
    </Box>
  );
};
