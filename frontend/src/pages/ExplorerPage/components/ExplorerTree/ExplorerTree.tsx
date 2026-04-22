import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
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
import styles from './ExplorerTree.module.css';

const collectSubtreeIds = (rootId: number, folders: FolderDto[]): Set<number> => {
  const byParent = new Map<number | null, number[]>();
  folders.forEach(f => {
    const p = f.parentId ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(f.id);
  });
  const out = new Set<number>();
  const q = [rootId];
  while (q.length) {
    const id = q.pop()!;
    out.add(id);
    (byParent.get(id) ?? []).forEach(c => q.push(c));
  }
  return out;
};

const visibleFolderIdsInOrder = (
  nodes: FolderTreeNode[],
  expanded: Set<number>
): number[] => {
  const out: number[] = [];
  const walk = (list: FolderTreeNode[]) => {
    for (const n of list) {
      out.push(n.id);
      if (expanded.has(n.id)) walk(n.children);
    }
  };
  walk(nodes);
  return out;
};

export const ExplorerTree: React.FC = () => {
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams<{ id: string }>();

  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [notes, setNotes] = useState<ExplorerNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const [newFolderParentId, setNewFolderParentId] = useState<number | null | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [renaming, setRenaming] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  const [folderMenu, setFolderMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);
  const [noteMenu, setNoteMenu] = useState<{ anchor: HTMLElement; id: number } | null>(null);

  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [folderRangeAnchorId, setFolderRangeAnchorId] = useState<number | null>(null);
  const [reparentTarget, setReparentTarget] = useState<{
    folderIds: number[];
    noteIds: number[];
  } | null>(null);
  const [pickItemsMode, setPickItemsMode] = useState(false);

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

  const tree = useMemo(() => buildFolderTree(folders), [folders]);
  const visibleFolderIds = useMemo(
    () => visibleFolderIdsInOrder(tree, expanded),
    [tree, expanded]
  );

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

  const disabledMoveDestFolderIds = useMemo(() => {
    if (!reparentTarget || reparentTarget.folderIds.length === 0) return new Set<number>();
    const out = new Set<number>();
    reparentTarget.folderIds.forEach(id => {
      collectSubtreeIds(id, folders).forEach(x => out.add(x));
    });
    return out;
  }, [reparentTarget, folders]);

  const selectionCount = selectedFolderIds.size + selectedNoteIds.size;

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
      <Box className={styles.header}>
        <span className={styles.heading}>vault</span>
        <Box
          className={styles.headerActions}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
        >
          {selectionCount > 0 && (
            <>
              <Typography
                component="span"
                sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {selectionCount} selected
              </Typography>
              <IconButton
                size="small"
                className={styles.headerBtn}
                title="Move to folder (Ctrl+M)"
                onClick={() =>
                  setReparentTarget({
                    folderIds: [...selectedFolderIds],
                    noteIds: [...selectedNoteIds],
                  })
                }
              >
                <DriveFileMoveIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton size="small" className={styles.headerBtn} title="Clear selection" onClick={clearSelection}>
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </>
          )}
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<ChecklistIcon sx={{ fontSize: 16, opacity: 0.85 }} />}
            title={
              pickItemsMode
                ? 'Exit select mode (clears selection)'
                : 'Select notes & folders to move'
            }
            aria-pressed={pickItemsMode}
            onClick={() => {
              if (pickItemsMode) exitPickItemsMode();
              else setPickItemsMode(true);
            }}
            sx={{
              flexShrink: 0,
              minWidth: 'max-content',
              px: 0.5,
              py: 0.25,
              fontSize: 11,
              lineHeight: 1.2,
              textTransform: 'none',
              letterSpacing: 0.01,
              whiteSpace: 'nowrap',
              color: pickItemsMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
              backgroundColor: pickItemsMode ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            {pickItemsMode ? 'Done' : 'Select'}
          </Button>
          <IconButton
            size="small"
            className={styles.headerBtn}
            title="New folder"
            onClick={() => {
              setNewFolderName('');
              setNewFolderParentId(null);
            }}
          >
            <CreateNewFolderIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>

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

type FolderSubtreeProps = {
  node: FolderTreeNode;
  depth: number;
  notes: ExplorerNoteItem[];
  expanded: Set<number>;
  activeNoteId?: string;
  renaming: number | null;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onFolderMenu: (anchor: HTMLElement, id: number) => void;
  onFolderRowClick: (e: React.MouseEvent, folderId: number) => void;
  onChevronClick: (id: number) => void;
  onNoteOpen: (id: number) => void;
  onNoteMenu: (anchor: HTMLElement, id: number) => void;
  onNewSubfolder: (parentId: number) => void;
  selectedFolderIds: Set<number>;
  selectedNoteIds: Set<number>;
  onNoteRowClick: (e: React.MouseEvent, noteId: number, openNote: () => void) => void;
  pickItemsMode: boolean;
  toggleFolderInSelection: (id: number) => void;
  toggleNoteInSelection: (id: number) => void;
};

const FolderSubtree: React.FC<FolderSubtreeProps> = ({
  node,
  depth,
  notes,
  expanded,
  activeNoteId,
  renaming,
  renameValue,
  renameRef,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onFolderMenu,
  onFolderRowClick,
  onChevronClick,
  onNoteOpen,
  onNoteMenu,
  onNewSubfolder,
  selectedFolderIds,
  selectedNoteIds,
  onNoteRowClick,
  pickItemsMode,
  toggleFolderInSelection,
  toggleNoteInSelection,
}) => {
  const isOpen = expanded.has(node.id);
  const folderNotes = notes.filter(n => n.folderId === node.id);
  const indent = 10 + depth * 16;

  return (
    <>
      <Box
        className={`${styles.row} ${selectedFolderIds.has(node.id) ? styles.rowActive : ''}`}
        sx={{ pl: `${indent}px` }}
        onClick={e => onFolderRowClick(e, node.id)}
      >
        {pickItemsMode && (
          <span className={styles.rowCheck} onClick={e => e.stopPropagation()}>
            <Checkbox
              size="small"
              checked={selectedFolderIds.has(node.id)}
              onChange={() => toggleFolderInSelection(node.id)}
              inputProps={{ 'aria-label': `Select folder ${node.name}` }}
              sx={{ p: 0.25, color: 'rgba(255,255,255,0.45)' }}
            />
          </span>
        )}
        <span
          className={styles.chevron}
          onClick={ev => {
            ev.stopPropagation();
            onChevronClick(node.id);
          }}
        >
          {isOpen ? (
            <ExpandMoreIcon sx={{ fontSize: 14 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 14 }} />
          )}
        </span>
        <span className={styles.rowIcon}>
          {isOpen ? (
            <FolderOpenIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }} />
          ) : (
            <FolderIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }} />
          )}
        </span>

        {renaming === node.id ? (
          <TextField
            inputRef={renameRef}
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') onRenameCommit();
              if (e.key === 'Escape') onRenameCancel();
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
            variant="standard"
            size="small"
            className={styles.renameInput}
            sx={{ flex: 1 }}
          />
        ) : (
          <span className={styles.label}>{node.name}</span>
        )}

        {renaming !== node.id && (
          <Box className={styles.rowActions} onClick={e => e.stopPropagation()}>
            <IconButton size="small" className={styles.actionBtn} title="New subfolder" onClick={() => onNewSubfolder(node.id)}>
              <CreateNewFolderIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <IconButton size="small" className={styles.actionBtn} onClick={e => onFolderMenu(e.currentTarget, node.id)}>
              <MoreHorizIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {isOpen && (
        <>
          {folderNotes.map(note => (
            <NoteRow
              key={note.id}
              note={note}
              depth={depth + 1}
              active={activeNoteId === String(note.id)}
              selected={selectedNoteIds.has(note.id)}
              pickItemsMode={pickItemsMode}
              onOpen={onNoteOpen}
              onRowClick={onNoteRowClick}
              onMenuOpen={onNoteMenu}
              onTogglePick={() => toggleNoteInSelection(note.id)}
            />
          ))}
          {node.children.map(child => (
            <FolderSubtree
              key={child.id}
              node={child}
              depth={depth + 1}
              notes={notes}
              expanded={expanded}
              activeNoteId={activeNoteId}
              renaming={renaming}
              renameValue={renameValue}
              renameRef={renameRef}
              onRenameChange={onRenameChange}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
              onFolderMenu={onFolderMenu}
              onFolderRowClick={onFolderRowClick}
              onChevronClick={onChevronClick}
              onNoteOpen={onNoteOpen}
              onNoteMenu={onNoteMenu}
              onNewSubfolder={onNewSubfolder}
              selectedFolderIds={selectedFolderIds}
              selectedNoteIds={selectedNoteIds}
              onNoteRowClick={onNoteRowClick}
              pickItemsMode={pickItemsMode}
              toggleFolderInSelection={toggleFolderInSelection}
              toggleNoteInSelection={toggleNoteInSelection}
            />
          ))}
        </>
      )}
    </>
  );
};

type NoteRowProps = {
  note: ExplorerNoteItem;
  depth: number;
  active: boolean;
  selected: boolean;
  pickItemsMode: boolean;
  onOpen: (id: number) => void;
  onRowClick: (e: React.MouseEvent, noteId: number, openNote: () => void) => void;
  onMenuOpen: (anchor: HTMLElement, id: number) => void;
  onTogglePick: () => void;
};

const NoteRow: React.FC<NoteRowProps> = ({
  note,
  depth,
  active,
  selected,
  pickItemsMode,
  onOpen,
  onRowClick,
  onMenuOpen,
  onTogglePick,
}) => {
  const indent = 10 + depth * 16 + 14;

  return (
    <Box
      className={`${styles.row} ${active || selected ? styles.rowActive : ''}`}
      sx={{ pl: `${indent}px` }}
      onClick={e => onRowClick(e, note.id, () => onOpen(note.id))}
    >
      {pickItemsMode && (
        <span className={styles.rowCheck} onClick={e => e.stopPropagation()}>
          <Checkbox
            size="small"
            checked={selected}
            onChange={() => onTogglePick()}
            inputProps={{ 'aria-label': `Select note ${note.name}` }}
            sx={{ p: 0.25, color: 'rgba(255,255,255,0.45)' }}
          />
        </span>
      )}
      <span className={styles.rowIcon}>
        {note.isMemo ? (
          <StickyNote2Icon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />
        ) : (
          <CheckBoxIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />
        )}
      </span>
      <span className={`${styles.label} ${active ? styles.labelActive : ''}`}>{note.name}</span>
      <Box className={styles.rowActions} onClick={e => e.stopPropagation()}>
        <IconButton size="small" className={styles.actionBtn} onClick={e => onMenuOpen(e.currentTarget, note.id)}>
          <MoreHorizIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>
    </Box>
  );
};
