import React from 'react';
import { Box, Checkbox, IconButton } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import styles from './ExplorerTree.module.css';

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

export const NoteRow: React.FC<NoteRowProps> = ({
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

