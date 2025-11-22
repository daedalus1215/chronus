import React, { useState } from "react";
import { useCheckItems } from "../../hooks/useCheckItems";
import { Note } from "../../api/responses";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useCheckItemsQuery } from '../../hooks/useCheckItems';
import { useIsMobile } from "../../../../hooks/useIsMobile";
import styles from "./CheckListView.module.css";

type CheckListViewProps = {
  note: Note;
};

export const CheckListView: React.FC<CheckListViewProps> = ({ note }) => {
  const isMobile = useIsMobile();
  const [newItem, setNewItem] = useState("");
  const { data: checkItems = [], error } = useCheckItemsQuery(note.id);
  const { addItem, toggleItem, deleteItem, updateItem } = useCheckItems(note);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await addItem(newItem.trim());
      setNewItem("");
    } catch (err) {
      // You might want to show an error toast here
      console.error("Failed to add item:", err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleItem(id, note);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId == null) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteItem(deleteTargetId);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (err: unknown) {
      setIsDeleting(false);
      let message = 'Failed to delete check item';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setDeleteError(message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteError(null);
  };

  const handleEdit = async (id: number, name: string) => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  return (
    <Box className={`${styles.pageWrapper} ${isMobile ? styles.mobile : ''}`}>
      <Paper elevation={3} className={`${styles.container} ${isMobile ? styles.mobile : ''}`} sx={{ p: 2, mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
        <Box className={styles.addItemContainer} sx={{ mb: 2, gap: 1 }}>
          <TextField
            variant="standard"
            fullWidth
            placeholder="+ Add Task"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            sx={{ minWidth: 80 }}
          >
            Add
          </Button>
        </Box>
        <List className={styles.list}>
          {checkItems?.map((item) => (
            <ListItem
              key={item.id}
              className={styles.listItem}
              sx={{
                background: item.doneDate ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                py: 0.5,
                px: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
              disablePadding
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, pr: 6 }}>
                <Checkbox
                  checked={!!item.doneDate}
                  onChange={() => handleToggle(item.id)}
                  sx={{ mt: 0.5 }}
                  color="primary"
                />
                <TextField
                  value={item.name}
                  onChange={(e) => handleEdit(item.id, e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    multiline: true,
                    style: {
                      textDecoration: item.doneDate ? 'line-through' : undefined,
                      color: item.doneDate ? 'var(--color-text-secondary)' : 'var(--color-text)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    },
                  }}
                  sx={{
                    flex: 1,
                    background: 'transparent',
                    '& .MuiInputBase-root': {
                      padding: '4px 0',
                    }
                  }}
                />
              </Box>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteClick(item.id)}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-checkitem-dialog-title"
      >
        <DialogTitle id="delete-checkitem-dialog-title">Delete Check Item?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this check item? This action cannot be undone.
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
