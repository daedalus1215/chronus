import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import { fetchFolders } from '../../api/requests/folders.requests';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
} from '../../api/dtos/folder.dtos';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (folder: FolderDto | null) => void;
  /** Folder ids that cannot be chosen (e.g. selected folders and their descendants). */
  disabledFolderIds?: ReadonlySet<number>;
  dialogTitle?: string;
  helperText?: string;
};

export const MoveNoteDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  disabledFolderIds,
  dialogTitle = 'Move to folder',
  helperText,
}) => {
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FolderDto | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setLoading(true);
    fetchFolders()
      .then(setFolders)
      .finally(() => setLoading(false));
  }, [open]);

  const tree = buildFolderTree(folders);
  const disabled = disabledFolderIds ?? new Set<number>();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      {helperText ? (
        <Box sx={{ px: 3, pb: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        </Box>
      ) : null}
      <DialogContent dividers sx={{ p: 0, minHeight: 200 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List dense disablePadding>
            <ListItemButton
              selected={selected === null}
              onClick={() => setSelected(null)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AllInboxIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Root (no folder)" />
            </ListItemButton>
            {tree.map(node => (
              <FolderPickerItem
                key={node.id}
                node={node}
                depth={0}
                selected={selected}
                disabledFolderIds={disabled}
                onSelect={setSelected}
              />
            ))}
            {tree.length === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  No folders yet
                </Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={selected !== null && disabled.has(selected.id)}
          onClick={() => onConfirm(selected)}
        >
          Move here
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type PickerItemProps = {
  node: FolderTreeNode;
  depth: number;
  selected: FolderDto | null;
  disabledFolderIds: ReadonlySet<number>;
  onSelect: (f: FolderDto) => void;
};

const FolderPickerItem: React.FC<PickerItemProps> = ({
  node,
  depth,
  selected,
  disabledFolderIds,
  onSelect,
}) => {
  const isDisabled = disabledFolderIds.has(node.id);
  return (
    <>
      <ListItemButton
        selected={selected?.id === node.id}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) onSelect(node);
        }}
        sx={{ pl: `${1 + depth * 1.5}rem` }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <FolderIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={node.name} />
      </ListItemButton>
      {node.children.map(child => (
        <FolderPickerItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selected={selected}
          disabledFolderIds={disabledFolderIds}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};
