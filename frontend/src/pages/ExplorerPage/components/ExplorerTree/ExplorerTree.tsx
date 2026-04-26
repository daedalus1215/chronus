import React, { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ExplorerTreeDialogs } from './ExplorerTreeDialogs';
import { ExplorerTreeHeader } from './ExplorerTreeHeader';
import { ExplorerTreeMenus } from './ExplorerTreeMenus';
import { FolderSubtree } from './FolderSubtree/FolderSubtree';
import { NoteRow } from './NoteRow';
import { useFolderOperations } from './useFolderOperations';
import styles from './ExplorerTree.module.css';

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

  // Folder operations hook (data, dialogs, CRUD)
  const {
    folders,
    notes,
    loading,
    tree,
    visibleFolderIds,
    newFolderParentId,
    setNewFolderParentId,
    newFolderName,
    setNewFolderName,
    deleteConfirmId,
    setDeleteConfirmId,
    renaming,
    renameValue,
    renameRef,
    setRenameValue,
    startRename,
    commitRename,
    expanded,
    toggle,
    reparentTarget,
    setReparentTarget,
    disabledMoveDestFolderIds,
    handleCreateMemo,
    handleCreateFolder,
    handleDeleteFolder,
    handleReparentConfirm,
  } = useFolderOperations(selectedFolderIds);

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
  }, [clearSelection, exitPickItemsMode, pickItemsMode, selectedFolderIds, selectedNoteIds]);

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
      }
    },
    [folderRangeAnchorId, pickItemsMode, toggleFolderInSelection, visibleFolderIds]
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

  const rootNotes = notes.filter(n => n.folderId === null);

  return (
    <Box className={styles.tree}>
      <ExplorerTreeHeader
        selectionCount={selectionCount}
        pickItemsMode={pickItemsMode}
        onMoveSelected={() =>
          setReparentTarget({
            folderIds: [...selectedFolderIds],
            noteIds: [...selectedNoteIds],
          })
        }
        onClearSelection={clearSelection}
        onTogglePickItems={() => {
          if (pickItemsMode) exitPickItemsMode();
          else setPickItemsMode(true);
        }}
        onNewFolder={() => {
          setNewFolderName('');
          setNewFolderParentId(null);
        }}
        onNewMemo={handleCreateMemo}
      />

      <Box className={styles.body}>
        {tree.map(node => (
          <FolderSubtree
            key={node.id}
            node={node}
            depth={0}
            notes={notes}
            expanded={expanded}
            activeNoteId={activeNoteId}
            renaming={renaming}
            renameValue={renameValue}
            renameRef={renameRef}
            onRenameChange={setRenameValue}
            onRenameCommit={commitRename}
            onRenameCancel={() => setRenaming(null)}
            onFolderMenu={(anchor, id) => setFolderMenu({ anchor, id })}
            onFolderRowClick={handleFolderRowClick}
            onChevronClick={toggle}
            onNoteOpen={id => navigate(`notes/${id}`)}
            onNoteMenu={(anchor, id) => setNoteMenu({ anchor, id })}
            onNewSubfolder={id => {
              setNewFolderName('');
              setNewFolderParentId(id);
            }}
            selectedFolderIds={selectedFolderIds}
            selectedNoteIds={selectedNoteIds}
            onNoteRowClick={handleNoteRowClick}
            pickItemsMode={pickItemsMode}
            toggleFolderInSelection={toggleFolderInSelection}
            toggleNoteInSelection={toggleNoteInSelection}
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
            onOpen={id => navigate(`notes/${id}`)}
            onRowClick={handleNoteRowClick}
            onMenuOpen={(anchor, id) => setNoteMenu({ anchor, id })}
            onTogglePick={() => toggleNoteInSelection(note.id)}
          />
        ))}

        {rootNotes.length === 0 && tree.length === 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No notes or folders yet</Typography>
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <ExplorerTreeDialogs
        newFolderParentId={newFolderParentId}
        setNewFolderParentId={setNewFolderParentId}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
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
        setNewFolderName={setNewFolderName}
        setDeleteConfirmId={setDeleteConfirmId}
        noteMenu={noteMenu}
        setNoteMenu={setNoteMenu}
      />
    </Box>
  );
};
