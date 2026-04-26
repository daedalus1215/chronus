import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Menu,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildFolderTree,
  FolderDto,
} from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import {
  bulkReparentFolders,
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import { getNotesForExplorer, moveNoteToFolder } from '../../../../api/requests/notes.requests';
import { MoveNoteDialog } from '../MoveNoteDialog/MoveNoteDialog';
import { ExplorerTreeHeader } from './ExplorerTreeHeader';
import { FolderSubtree } from './FolderSubtree/FolderSubtree';
import { NoteRow } from './NoteRow';
import {
  collectSubtreeIds,
  visibleFolderIdsInOrder,
} from './utils';
import styles from './ExplorerTree.module.css';

export const ExplorerTree: React.FC = () => {
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams<{ id: string }>();

  // Data state
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [notes, setNotes] = useState<ExplorerNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Dialog state
  const [newFolderParentId, setNewFolderParentId] = useState<number | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Rename state
  const [renaming, setRenaming] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  // Menu state
  const [folderMenu, setFolderMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);
  const [noteMenu, setNoteMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);

  // Selection state
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [folderRangeAnchorId, setFolderRangeAnchorId] = useState<number | null>(null);
  const [reparentTarget, setReparentTarget] = useState<{
    folderIds: number[];
    noteIds: number[];
  } | null>(null);
  const [pickItemsMode, setPickItemsMode] = useState(false);

  // Data loading
  const load = useCallback(async () => {
    const [folderData, noteData] = await Promise.all([
      fetchFolders(),
      getNotesForExplorer(),
    ]);
    setFolders(folderData);
    setNotes(noteData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived data
  const tree = useMemo(() => buildFolderTree(folders), [folders]);
  const visibleFolderIds = useMemo(
    () => visibleFolderIdsInOrder(tree, expanded),
    [tree, expanded]
  );

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

  // Folder operations
  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const folder = await createFolder({ name, parentId: newFolderParentId ?? null });
    setFolders(prev => [...prev, folder]);
    setExpanded(prev => {
      const next = new Set(prev);
      if (newFolderParentId) next.add(newFolderParentId);
      return next;
    });
    setNewFolderParentId(undefined);
    setNewFolderName('');
  };

  const handleDeleteFolder = async () => {
    if (deleteConfirmId === null) return;
    await deleteFolder(deleteConfirmId);
    setFolders(prev => prev.filter(f => f.id !== deleteConfirmId));
    setNotes(prev => prev.map(n => (n.folderId === deleteConfirmId ? { ...n, folderId: null } : n)));
    setDeleteConfirmId(null);
    clearSelection();
  };

  const startRename = (id: number, currentName: string) => {
    setFolderMenu(null);
    setRenaming(id);
    setRenameValue(currentName);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const commitRename = async () => {
    if (renaming === null) return;
    const trimmed = renameValue.trim();
    if (trimmed) {
      const updated = await updateFolder(renaming, { name: trimmed });
      setFolders(prev => prev.map(f => (f.id === renaming ? updated : f)));
    }
    setRenaming(null);
  };

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

  // Reparent helpers
  const disabledMoveDestFolderIds = useMemo(() => {
    if (!reparentTarget || reparentTarget.folderIds.length === 0) return new Set<number>();
    const out = new Set<number>();
    reparentTarget.folderIds.forEach(id => {
      collectSubtreeIds(id, folders).forEach(x => out.add(x));
    });
    return out;
  }, [reparentTarget, folders]);

  const handleReparentConfirm = async (folder: FolderDto | null) => {
    if (!reparentTarget) return;
    const dest = folder?.id ?? null;
    const { folderIds, noteIds } = reparentTarget;
    try {
      if (folderIds.length >= 2) {
        await bulkReparentFolders({ folderIds, parentId: dest });
      } else if (folderIds.length === 1) {
        await updateFolder(folderIds[0], { parentId: dest });
      }
      if (noteIds.length > 0) {
        await Promise.all(noteIds.map(id => moveNoteToFolder(id, dest)));
      }
      await load();
    } finally {
      setReparentTarget(null);
      exitPickItemsMode();
    }
  };

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
      />

      <Box className={styles.body}>
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

        {rootNotes.length === 0 && tree.length === 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No notes or folders yet</Typography>
          </Box>
        )}
      </Box>

      {/* Folder context menu */}
      <Menu
        anchorEl={folderMenu?.anchor}
        open={Boolean(folderMenu)}
        onClose={() => setFolderMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            if (folderMenu) {
              setReparentTarget({ folderIds: [folderMenu.id], noteIds: [] });
            }
            setFolderMenu(null);
          }}
        >
          Move to folder…
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            const f = folders.find(x => x.id === folderMenu?.id);
            if (f) startRename(f.id, f.name);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (folderMenu) {
              setNewFolderParentId(folderMenu.id);
              setNewFolderName('');
            }
            setFolderMenu(null);
          }}
        >
          New subfolder
        </MenuItem>
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (folderMenu) setDeleteConfirmId(folderMenu.id);
            setFolderMenu(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Note context menu */}
      <Menu
        anchorEl={noteMenu?.anchor}
        open={Boolean(noteMenu)}
        onClose={() => setNoteMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            if (noteMenu) navigate(`notes/${noteMenu.id}`);
            setNoteMenu(null);
          }}
        >
          Open
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (noteMenu) setReparentTarget({ folderIds: [], noteIds: [noteMenu.id] });
            setNoteMenu(null);
          }}
        >
          Move to folder…
        </MenuItem>
      </Menu>

      {/* New folder dialog */}
      <Dialog
        open={newFolderParentId !== undefined}
        onClose={() => setNewFolderParentId(undefined)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderParentId(undefined)}>Cancel</Button>
          <Button variant="contained" disabled={!newFolderName.trim()} onClick={handleCreateFolder}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deletes this folder and all subfolders. Notes inside return to root.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteFolder}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move to folder dialog */}
      {reparentTarget !== null && (
        <MoveNoteDialog
          open
          onClose={() => setReparentTarget(null)}
          onConfirm={handleReparentConfirm}
          disabledFolderIds={disabledMoveDestFolderIds}
          dialogTitle={
            reparentTarget.folderIds.length + reparentTarget.noteIds.length > 1
              ? `Move ${reparentTarget.folderIds.length + reparentTarget.noteIds.length} items`
              : 'Move to folder'
          }
          helperText={
            reparentTarget.folderIds.length >= 2
              ? 'If you selected a folder and its subfolders, only the top folder is moved; children stay attached.'
              : undefined
          }
        />
      )}
    </Box>
  );
};
