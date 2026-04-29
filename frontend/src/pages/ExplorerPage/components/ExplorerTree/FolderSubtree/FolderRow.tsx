import React from 'react';
import { Box, Checkbox, IconButton, TextField } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderTreeNode } from '../../../../../api/dtos/folder.dtos';
import { DragMode } from '../ExplorerTree';
import { DropIntent } from '../useDragOperations';
import styles from '../ExplorerTree.module.css';

type FolderRowProps = {
  node: FolderTreeNode;
  depth: number;
  expanded: Set<number>;
  renaming: number | null;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  selected: boolean;
  pickItemsMode: boolean;
  dragMode: DragMode;
  dropIntent: DropIntent;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onFolderMenu: (anchor: HTMLElement, id: number) => void;
  onFolderRowClick: (e: React.MouseEvent, folderId: number) => void;
  onChevronClick: (id: number) => void;
  onNewSubfolder: (parentId: number) => void;
  onTogglePick: (id: number) => void;
};

export const FolderRow: React.FC<FolderRowProps> = React.memo(({
  node,
  depth,
  expanded,
  renaming,
  renameValue,
  renameRef,
  selected,
  pickItemsMode,
  dragMode,
  dropIntent,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onFolderMenu,
  onFolderRowClick,
  onChevronClick,
  onNewSubfolder,
  onTogglePick,
}) => {
  const isOpen = expanded.has(node.id);
  const indent = 10 + depth * 16;
  const isDropTarget = dropIntent?.type === 'into' && dropIntent.overId === `folder-${node.id}`;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `folder-${node.id}`,
    disabled: dragMode === 'off',
  });

  const style = dragMode !== 'off'
    ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`${styles.row} ${selected ? styles.rowActive : ''} ${isDropTarget ? styles.rowDropTarget : ''}`}
      sx={{ pl: `${indent}px` }}
      onClick={e => onFolderRowClick(e, node.id)}
    >
      {dragMode !== 'off' && (
        <span
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          <DragIndicatorIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
        </span>
      )}
      {pickItemsMode && (
        <span className={styles.rowCheck} onClick={e => e.stopPropagation()}>
          <Checkbox
            size="small"
            checked={selected}
            onChange={() => onTogglePick(node.id)}
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
  );
});
