import React from 'react';
import { Box, Checkbox, IconButton } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import { DragMode } from './ExplorerTree';
import styles from './ExplorerTree.module.css';

type NoteRowProps = {
  note: ExplorerNoteItem;
  depth: number;
  active: boolean;
  selected: boolean;
  pickItemsMode: boolean;
  dragMode: DragMode;
  onOpen: (id: number) => void;
  onRowClick: (
    e: React.MouseEvent,
    noteId: number,
    openNote: () => void
  ) => void;
  onMenuOpen: (anchor: HTMLElement, id: number) => void;
  onTogglePick: () => void;
  isMatch?: boolean;
  filterActive?: boolean;
};

export const NoteRow: React.FC<NoteRowProps> = React.memo(
  ({
    note,
    depth,
    active,
    selected,
    pickItemsMode,
    dragMode,
    onOpen,
    onRowClick,
    onMenuOpen,
    onTogglePick,
    isMatch = false,
    filterActive = false,
  }) => {
    const indent = 10 + depth * 16 + 14;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `note-${note.id}`,
      disabled: dragMode === 'off',
    });

    const style =
      dragMode !== 'off'
        ? {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.4 : 1,
          }
        : undefined;

    // A note is dimmed only if filter is active AND the note itself does NOT match
    const dimmed = filterActive && !isMatch;

    return (
      <Box
        ref={setNodeRef}
        style={style}
        className={`${styles.row} ${active || selected ? styles.rowActive : ''} ${dimmed ? styles.rowDimmed : ''}`}
        sx={{ pl: `${indent}px` }}
        onClick={e => onRowClick(e, note.id, () => onOpen(note.id))}
      >
        {dragMode !== 'off' && (
          <span
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
          >
            <DragIndicatorIcon
              sx={{ fontSize: 13, color: 'var(--color-text-muted)' }}
            />
          </span>
        )}
        {pickItemsMode && (
          <span className={styles.rowCheck} onClick={e => e.stopPropagation()}>
            <Checkbox
              size="small"
              checked={selected}
              onChange={() => onTogglePick()}
              inputProps={{ 'aria-label': `Select note ${note.name}` }}
              sx={{ p: 0.25, color: 'var(--color-text-muted)' }}
            />
          </span>
        )}
        <span className={styles.rowIcon}>
          {note.isMemo ? (
            <StickyNote2Icon
              sx={{ fontSize: 13, color: 'var(--color-text-muted)' }}
            />
          ) : (
            <CheckBoxIcon
              sx={{ fontSize: 13, color: 'var(--color-text-muted)' }}
            />
          )}
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
  }
);
