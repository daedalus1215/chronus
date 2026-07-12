import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  List,
  ListItemButton,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import NoteIcon from '@mui/icons-material/StickyNote2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import {
  getNotesForExplorer,
  moveNoteToFolder,
} from '../../../../api/requests/notes.requests';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { MoveNoteDialog } from '../MoveNoteDialog/MoveNoteDialog';
import styles from './NotesBrowser.module.css';

type Props = {
  folderId: string | undefined;
  folderLabel: string;
};

export const NotesBrowser: React.FC<Props> = ({ folderId, folderLabel }) => {
  const navigate = useNavigate();

  const [allNotes, setAllNotes] = useState<
    { name: string; id: number; isMemo: number; folderId: number | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const data = await getNotesForExplorer(folderId);
    setAllNotes(data);
    setIsLoading(false);
  }, [folderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const notes = allNotes.filter(
    n =>
      !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [menuState, setMenuState] = useState<{
    anchor: HTMLElement;
    noteId: number;
  } | null>(null);
  const [moveDialogNoteId, setMoveDialogNoteId] = useState<number | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    []
  );

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, noteId: number) => {
    e.stopPropagation();
    setMenuState({ anchor: e.currentTarget, noteId });
  };

  const handleMoveConfirm = async (folder: FolderDto | null) => {
    if (moveDialogNoteId === null) return;
    await moveNoteToFolder(moveDialogNoteId, folder?.id ?? null);
    setMoveDialogNoteId(null);
    fetchNotes();
  };

  return (
    <Box className={styles.browser}>
      {/* top bar */}
      <Box className={styles.topBar}>
        <Typography className={styles.breadcrumb} component="div">
          <ChevronRightIcon
            sx={{ fontSize: 11 }}
            className={styles.breadcrumbSep}
          />
          <span className={styles.breadcrumbCurrent}>{folderLabel}</span>
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Filter notes…"
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}
                />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ p: '2px' }}
                >
                  <ClearIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {isLoading ? (
        <Box className={styles.center}>
          <CircularProgress size={18} thickness={3} />
        </Box>
      ) : notes.length === 0 ? (
        <Box className={styles.center}>
          <Typography className={styles.emptyText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'Empty folder'}
          </Typography>
        </Box>
      ) : (
        <List disablePadding className={styles.list}>
          {notes.map(note => (
            <ListItemButton
              key={note.id}
              disableRipple
              onClick={() => navigate(`/notes/${note.id}`)}
              className={styles.noteRow}
            >
              <Box className={styles.noteIcon}>
                {note.isMemo ? (
                  <NoteIcon
                    sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}
                  />
                ) : (
                  <CheckBoxIcon
                    sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}
                  />
                )}
              </Box>
              <span className={styles.noteLabel}>{note.name}</span>
              <IconButton
                size="small"
                className={styles.noteMenuBtn}
                onClick={e => handleMenuOpen(e, note.id)}
              >
                <MoreHorizIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      )}

      <Menu
        anchorEl={menuState?.anchor}
        open={Boolean(menuState)}
        onClose={() => setMenuState(null)}
        slotProps={{ paper: { sx: { minWidth: 150 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            if (menuState) setMoveDialogNoteId(menuState.noteId);
            setMenuState(null);
          }}
        >
          Move to folder…
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (menuState) navigate(`/notes/${menuState.noteId}`);
            setMenuState(null);
          }}
        >
          Open
        </MenuItem>
      </Menu>

      {moveDialogNoteId !== null && (
        <MoveNoteDialog
          open
          onClose={() => setMoveDialogNoteId(null)}
          onConfirm={handleMoveConfirm}
        />
      )}
    </Box>
  );
};
