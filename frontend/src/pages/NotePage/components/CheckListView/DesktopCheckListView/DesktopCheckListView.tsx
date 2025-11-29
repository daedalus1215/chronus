import React from "react";
import { useCheckItems } from "../hooks/useCheckItems";
import { Note } from "../../../api/responses";
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
import { useCheckItemsQuery } from '../hooks/useCheckItems';
import { Fab } from "@mui/material";
import { Add as AddIcon } from '@mui/icons-material';
import styles from "./DesktopCheckListView.module.css";
import { useCheckItemEditDialog } from "../hooks/useCheckItemEditDialog";
import { EditCheckItemDialog } from "../EditCheckItemDialog/EditCheckItemDialog";
import { useAddCheckItemDialog } from "../hooks/useAddCheckItemDialog";
import { AddCheckItemDialog } from "../components/AddCheckItemDialog/AddCheckItemDialog";
import { useDeleteCheckItemDialog } from "../hooks/useDeleteCheckItemDialog";
import { DeleteCheckItemDialog } from "../DeleteCheckItemDialog/DeleteCheckItemDialog";

type CheckListViewProps = {
  note: Note;
};

export const DesktopCheckListView: React.FC<CheckListViewProps> = ({ note }) => {
  const { data: checkItems = [], error } = useCheckItemsQuery(note.id);
  const { addItem, toggleItem, deleteItem, updateItem } = useCheckItems(note);
  const {
    isOpen: isAddDialogOpen,
    value: newItemValue,
    openDialog: openAddDialog,
    closeDialog: closeAddDialog,
    changeValue: changeNewItemValue,
    saveNew,
  } = useAddCheckItemDialog();
  const {
    isOpen: isEditDialogOpen,
    editItemValue,
    openDialog: openEditDialog,
    closeDialog: closeEditDialog,
    changeValue: changeEditValue,
    saveEdit,
  } = useCheckItemEditDialog();
  const {
    isOpen: isDeleteDialogOpen,
    isDeleting,
    error: deleteError,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
    confirmDelete,
  } = useDeleteCheckItemDialog();

  const handleAdd = async () => {
    try {
      await addItem(newItemValue.trim());
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
    openDeleteDialog(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await confirmDelete(deleteItem);
    } catch (err) {
      console.error("Failed to delete check item:", err);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteDialog();
  };

  const handleEdit = async (id: number, name: string) => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };


  const handleSaveEdit = async () => {
    try {
      await saveEdit(handleEdit);
    } catch (err) {
      console.error("Failed to save edited item:", err);
    }
  };

  const handleCreateNote = async () => {
    try {
      await saveNew(handleAdd);
    } catch (err) {
      console.error("Failed to create check item:", err);
    }
  };

  return (
    <Box>
      <Paper elevation={.7} className={styles.container} sx={{ p: 2, mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

        {isAddDialogOpen && (
          <AddCheckItemDialog
            isOpen={isAddDialogOpen}
            value={newItemValue}
            onChange={changeNewItemValue}
            onSave={handleCreateNote}
            onClose={closeAddDialog}
          />
        )}
        {isEditDialogOpen && (
          <EditCheckItemDialog
            isOpen={isEditDialogOpen}
            value={editItemValue}
            onChange={changeEditValue}
            onSave={handleSaveEdit}
            onClose={closeEditDialog}
          />
        )}
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
                alignItems: 'center',
                gap: 1,
              }}
              disablePadding
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, pr: 6 }}>
                <Checkbox
                  checked={!!item.doneDate}
                  onChange={() => handleToggle(item.id)}
                  color="primary"
                />
                <Box
                  sx={{
                    flex: 1,
                    background: 'transparent',
                    padding: '4px 0',
                    cursor: 'pointer',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Edit check item"
                  onClick={() => openEditDialog(item.id, item.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEditDialog(item.id, item.name);
                    }
                  }}
                >
                  <span
                    style={{
                      textDecoration: item.doneDate ? 'line-through' : undefined,
                      color: item.doneDate ? 'var(--color-text-secondary)' : 'var(--color-text)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      display: 'block',
                    }}
                  >
                    {item.name}
                  </span>
                </Box>
              </Box>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteClick(item.id)}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  marginRight: '8px',
                  marginLeft: '8px',
                  transform: 'translateY(-50%)'
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <DeleteCheckItemDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <Fab
        color="primary"
        aria-label="Create new note"
        onClick={openAddDialog}
        // disabled={isCreating}
        sx={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
        }}
      >
        <AddIcon />
      </Fab>

    </Box>
  );
};
