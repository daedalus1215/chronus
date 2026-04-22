import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
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
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
} from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import { getNotesForExplorer, moveNoteToFolder } from '../../../../api/requests/notes.requests';
import { MoveNoteDialog } from '../MoveNoteDialog/MoveNoteDialog';
import styles from './ExplorerTree.module.css';

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
  const [moveNoteId, setMoveNoteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [folderData, noteData] = await Promise.all([
      fetchFolders(),
      getNotesForExplorer(),
    ]);
    setFolders(folderData);
    setNotes(noteData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    setNotes(prev => prev.map(n => n.folderId === deleteConfirmId ? { ...n, folderId: null } : n));
    setDeleteConfirmId(null);
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
      setFolders(prev => prev.map(f => f.id === renaming ? updated : f));
    }
    setRenaming(null);
  };

  const handleMoveNote = async (folder: FolderDto | null) => {
    if (moveNoteId === null) return;
    await moveNoteToFolder(moveNoteId, folder?.id ?? null);
    setNotes(prev =>
      prev.map(n => n.id === moveNoteId ? { ...n, folderId: folder?.id ?? null } : n)
    );
    setMoveNoteId(null);
  };

  if (loading) {
    return (
      <Box className={styles.loading}>
        <CircularProgress size={18} thickness={3} />
      </Box>
    );
  }

  const tree = buildFolderTree(folders);
  const rootNotes = notes.filter(n => n.folderId === null);

  return (
    <Box className={styles.tree}>
      {/* header */}
      <Box className={styles.header}>
        <span className={styles.heading}>vault</span>
        <IconButton
          size="small"
          className={styles.headerBtn}
          title="New folder"
          onClick={() => { setNewFolderName(''); setNewFolderParentId(null); }}
        >
          <CreateNewFolderIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* tree body */}
      <Box className={styles.body}>
        {/* root-level notes (no folder) */}
        {rootNotes.map(note => (
          <NoteRow
            key={note.id}
            note={note}
            depth={0}
            active={activeNoteId === String(note.id)}
            onOpen={id => navigate(`notes/${id}`)}
            onMenuOpen={(anchor, id) => setNoteMenu({ anchor, id })}
          />
        ))}

        {/* folders */}
        {tree.map(node => (
          <FolderSubtree
            key={node.id}
            node={node}
            depth={0}
            notes={notes}
            expanded={expanded}
            onToggle={toggle}
            activeNoteId={activeNoteId}
            renaming={renaming}
            renameValue={renameValue}
            renameRef={renameRef}
            onRenameChange={setRenameValue}
            onRenameCommit={commitRename}
            onRenameCancel={() => setRenaming(null)}
            onFolderMenu={(anchor, id) => setFolderMenu({ anchor, id })}
            onNoteOpen={id => navigate(`notes/${id}`)}
            onNoteMenu={(anchor, id) => setNoteMenu({ anchor, id })}
            onNewSubfolder={id => { setNewFolderName(''); setNewFolderParentId(id); }}
          />
        ))}

        {rootNotes.length === 0 && tree.length === 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              No notes or folders yet
            </Typography>
          </Box>
        )}
      </Box>

      {/* folder context menu */}
      <Menu
        anchorEl={folderMenu?.anchor}
        open={Boolean(folderMenu)}
        onClose={() => setFolderMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem dense onClick={() => {
          const f = folders.find(x => x.id === folderMenu?.id);
          if (f) startRename(f.id, f.name);
        }}>Rename</MenuItem>
        <MenuItem dense onClick={() => {
          if (folderMenu) { setNewFolderParentId(folderMenu.id); setNewFolderName(''); }
          setFolderMenu(null);
        }}>New subfolder</MenuItem>
        <MenuItem dense sx={{ color: 'error.main' }} onClick={() => {
          if (folderMenu) setDeleteConfirmId(folderMenu.id);
          setFolderMenu(null);
        }}>Delete</MenuItem>
      </Menu>

      {/* note context menu */}
      <Menu
        anchorEl={noteMenu?.anchor}
        open={Boolean(noteMenu)}
        onClose={() => setNoteMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem dense onClick={() => {
          if (noteMenu) navigate(`notes/${noteMenu.id}`);
          setNoteMenu(null);
        }}>Open</MenuItem>
        <MenuItem dense onClick={() => {
          if (noteMenu) setMoveNoteId(noteMenu.id);
          setNoteMenu(null);
        }}>Move to folder…</MenuItem>
      </Menu>

      {/* new folder dialog */}
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
          <Button
            variant="contained"
            disabled={!newFolderName.trim()}
            onClick={handleCreateFolder}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* delete folder confirmation */}
      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
      >
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

      {/* move note dialog */}
      {moveNoteId !== null && (
        <MoveNoteDialog
          open
          onClose={() => setMoveNoteId(null)}
          onConfirm={handleMoveNote}
        />
      )}
    </Box>
  );
};

// ── FolderSubtree ─────────────────────────────────────────────────────────────

type FolderSubtreeProps = {
  node: FolderTreeNode;
  depth: number;
  notes: NoteNameItem[];
  expanded: Set<number>;
  onToggle: (id: number) => void;
  activeNoteId?: string;
  renaming: number | null;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onFolderMenu: (anchor: HTMLElement, id: number) => void;
  onNoteOpen: (id: number) => void;
  onNoteMenu: (anchor: HTMLElement, id: number) => void;
  onNewSubfolder: (parentId: number) => void;
};

const FolderSubtree: React.FC<FolderSubtreeProps> = ({
  node,
  depth,
  notes,
  expanded,
  onToggle,
  activeNoteId,
  renaming,
  renameValue,
  renameRef,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onFolderMenu,
  onNoteOpen,
  onNoteMenu,
  onNewSubfolder,
}) => {
  const isOpen = expanded.has(node.id);
  const folderNotes = notes.filter(n => n.folderId === node.id);
  const indent = 10 + depth * 16;

  return (
    <>
      <Box
        className={styles.row}
        sx={{ pl: `${indent}px` }}
        onClick={() => onToggle(node.id)}
      >
        <span className={styles.chevron}>
          {isOpen
            ? <ExpandMoreIcon sx={{ fontSize: 14 }} />
            : <ChevronRightIcon sx={{ fontSize: 14 }} />}
        </span>
        <span className={styles.rowIcon}>
          {isOpen
            ? <FolderOpenIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }} />
            : <FolderIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }} />}
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
            <IconButton
              size="small"
              className={styles.actionBtn}
              title="New subfolder"
              onClick={() => onNewSubfolder(node.id)}
            >
              <CreateNewFolderIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <IconButton
              size="small"
              className={styles.actionBtn}
              onClick={e => onFolderMenu(e.currentTarget, node.id)}
            >
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
              onOpen={onNoteOpen}
              onMenuOpen={onNoteMenu}
            />
          ))}
          {node.children.map(child => (
            <FolderSubtree
              key={child.id}
              node={child}
              depth={depth + 1}
              notes={notes}
              expanded={expanded}
              onToggle={onToggle}
              activeNoteId={activeNoteId}
              renaming={renaming}
              renameValue={renameValue}
              renameRef={renameRef}
              onRenameChange={onRenameChange}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
              onFolderMenu={onFolderMenu}
              onNoteOpen={onNoteOpen}
              onNoteMenu={onNoteMenu}
              onNewSubfolder={onNewSubfolder}
            />
          ))}
        </>
      )}
    </>
  );
};

// ── NoteRow ───────────────────────────────────────────────────────────────────

type NoteRowProps = {
  note: NoteNameItem;
  depth: number;
  active: boolean;
  onOpen: (id: number) => void;
  onMenuOpen: (anchor: HTMLElement, id: number) => void;
};

const NoteRow: React.FC<NoteRowProps> = ({ note, depth, active, onOpen, onMenuOpen }) => {
  const indent = 10 + depth * 16 + 14;

  return (
    <Box
      className={`${styles.row} ${active ? styles.rowActive : ''}`}
      sx={{ pl: `${indent}px` }}
      onClick={() => onOpen(note.id)}
    >
      <span className={styles.rowIcon}>
        {note.isMemo
          ? <StickyNote2Icon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />
          : <CheckBoxIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />}
      </span>
      <span className={`${styles.label} ${active ? styles.labelActive : ''}`}>
        {note.name}
      </span>
      <Box className={styles.rowActions} onClick={e => e.stopPropagation()}>
        <IconButton
          size="small"
          className={styles.actionBtn}
          onClick={e => onMenuOpen(e.currentTarget, note.id)}
        >
          <MoreHorizIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>
    </Box>
  );
};
