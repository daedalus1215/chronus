import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
} from '../../../../api/dtos/folder.dtos';
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import { FolderTreeItem } from './FolderTreeItem';
import styles from './FolderTree.module.css';

type Props = {
  selectedId: number | null;
  onSelect: (id: number | null, name?: string) => void;
};

export const FolderTree: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderDialog, setNewFolderDialog] = useState<{
    open: boolean;
    parentId: number | null;
  }>({ open: false, parentId: null });
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = useCallback(async () => {
    const data = await fetchFolders();
    setFolders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateOpen = (parentId: number | null) => {
    setNewFolderName('');
    setNewFolderDialog({ open: true, parentId });
  };

  const handleCreateConfirm = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const folder = await createFolder({
      name,
      parentId: newFolderDialog.parentId,
    });
    setFolders(prev => [...prev, folder]);
    setNewFolderDialog({ open: false, parentId: null });
  };

  const handleRename = async (id: number, newName: string) => {
    const updated = await updateFolder(id, { name: newName });
    setFolders(prev => prev.map(f => (f.id === id ? updated : f)));
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm === null) return;
    await deleteFolder(deleteConfirm);
    setFolders(prev => prev.filter(f => f.id !== deleteConfirm));
    if (selectedId === deleteConfirm) onSelect(null);
    setDeleteConfirm(null);
  };

  const tree: FolderTreeNode[] = buildFolderTree(folders);

  return (
    <Box className={styles.tree}>
      <Box className={styles.treeHeader}>
        <Typography variant="overline" className={styles.heading}>
          Folders
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleCreateOpen(null)}
          title="New folder"
          className={styles.headerBtn}
        >
          <CreateNewFolderIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {loading ? (
        <Box className={styles.loading}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <List disablePadding dense>
          <ListItemButton
            disableRipple
            selected={selectedId === null}
            onClick={() => onSelect(null, 'All Notes')}
            className={styles.item}
            sx={{ pl: '10px' }}
          >
            <Box component="span" className={styles.chevron} />
            <Box component="span" className={styles.icon}>
              <AllInboxIcon
                sx={{
                  fontSize: 14,
                  color:
                    selectedId === null
                      ? 'primary.light'
                      : 'rgba(255,255,255,0.45)',
                }}
              />
            </Box>
            <span
              className={`${styles.label} ${selectedId === null ? styles.labelSelected : ''}`}
            >
              All Notes
            </span>
          </ListItemButton>

          {tree.map(node => (
            <FolderTreeItem
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={handleCreateOpen}
              onRename={handleRename}
              onDelete={id => setDeleteConfirm(id)}
            />
          ))}

          {tree.length === 0 && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                No folders yet
              </Typography>
            </Box>
          )}
        </List>
      )}

      {/* New folder dialog */}
      <Dialog
        open={newFolderDialog.open}
        onClose={() => setNewFolderDialog({ open: false, parentId: null })}
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
            onKeyDown={e => e.key === 'Enter' && handleCreateConfirm()}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNewFolderDialog({ open: false, parentId: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConfirm}
            variant="contained"
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete the folder and all subfolders. Notes inside will
            move to root. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
