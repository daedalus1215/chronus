import React, { useRef, useState } from 'react';
import {
  Box,
  IconButton,
  ListItemButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { FolderTreeNode } from '../../../../api/dtos/folder.dtos';
import styles from './FolderTree.module.css';

type Props = {
  node: FolderTreeNode;
  depth: number;
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
  onCreateChild: (parentId: number | null) => void;
  onRename: (id: number, newName: string) => Promise<void>;
  onDelete: (id: number) => void;
};

export const FolderTreeItem: React.FC<Props> = ({
  node,
  depth,
  selectedId,
  onSelect,
  onCreateChild,
  onRename,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const handleSelect = () => {
    onSelect(node.id, node.name);
    if (hasChildren) setExpanded(true);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleRenameStart = () => {
    setMenuAnchor(null);
    setRenameValue(node.name);
    setRenaming(true);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const handleRenameCommit = async () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) await onRename(node.id, trimmed);
    setRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameCommit();
    if (e.key === 'Escape') setRenaming(false);
  };

  const indentPx = 10 + depth * 16;

  return (
    <>
      <ListItemButton
        disableRipple
        selected={isSelected}
        onClick={handleSelect}
        className={styles.item}
        sx={{ pl: `${indentPx}px` }}
      >
        {/* chevron */}
        <Box component="span" className={styles.chevron} onClick={handleToggle}>
          {hasChildren ? (
            expanded ? (
              <ExpandMoreIcon sx={{ fontSize: 14 }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: 14 }} />
            )
          ) : null}
        </Box>

        {/* folder icon */}
        <Box component="span" className={styles.icon}>
          {expanded || isSelected ? (
            <FolderOpenIcon
              sx={{
                fontSize: 14,
                color: isSelected ? 'primary.light' : 'var(--color-text-muted)',
              }}
            />
          ) : (
            <FolderIcon
              sx={{ fontSize: 14, color: 'var(--color-text-muted)' }}
            />
          )}
        </Box>

        {/* label or inline rename */}
        {renaming ? (
          <TextField
            inputRef={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={handleRenameKeyDown}
            onClick={e => e.stopPropagation()}
            autoFocus
            variant="standard"
            size="small"
            className={styles.renameInput}
            sx={{ flex: 1 }}
            InputProps={{ disableUnderline: false }}
          />
        ) : (
          <span
            className={`${styles.label} ${isSelected ? styles.labelSelected : ''}`}
          >
            {node.name}
          </span>
        )}

        {/* hover actions */}
        {!renaming && (
          <Box
            className={styles.itemActions}
            onClick={e => e.stopPropagation()}
          >
            <IconButton
              size="small"
              className={styles.actionBtn}
              onClick={e => {
                onCreateChild(node.id);
                e.stopPropagation();
              }}
              title="New subfolder"
            >
              <CreateNewFolderIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <IconButton
              size="small"
              className={styles.actionBtn}
              onClick={handleMenuOpen}
            >
              <MoreHorizIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        )}
      </ListItemButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onClick={e => e.stopPropagation()}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem dense onClick={handleRenameStart}>
          Rename
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setMenuAnchor(null);
            onDelete(node.id);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {expanded &&
        node.children.map(child => (
          <FolderTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            onCreateChild={onCreateChild}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};
