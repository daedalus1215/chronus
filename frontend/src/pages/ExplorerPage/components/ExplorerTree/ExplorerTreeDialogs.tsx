import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { MoveNoteDialog } from '../MoveNoteDialog/MoveNoteDialog';

type ExplorerTreeDialogsProps = {
  // New folder dialog
  newFolderParentId: number | null | undefined;
  setNewFolderParentId: (v: number | null | undefined) => void;
  handleCreateFolder: (name: string) => void;

  // Delete dialog
  deleteConfirmId: number | null;
  setDeleteConfirmId: (v: number | null) => void;
  handleDeleteFolder: () => void;

  // Reparent dialog
  reparentTarget: { folderIds: number[]; noteIds: number[] } | null;
  setReparentTarget: (v: { folderIds: number[]; noteIds: number[] } | null) => void;
  handleReparentConfirm: (folder: FolderDto | null) => void;
  disabledMoveDestFolderIds: Set<number>;
}

export const ExplorerTreeDialogs: React.FC<ExplorerTreeDialogsProps> = ({
  newFolderParentId,
  setNewFolderParentId,
  handleCreateFolder,
  deleteConfirmId,
  setDeleteConfirmId,
  handleDeleteFolder,
  reparentTarget,
  setReparentTarget,
  handleReparentConfirm,
  disabledMoveDestFolderIds,
}) => {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (newFolderParentId === undefined) setFolderName('');
  }, [newFolderParentId]);

  return (
    <>
      {/* New folder dialog */}
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
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder(folderName)}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderParentId(undefined)}>Cancel</Button>
          <Button variant="contained" disabled={!folderName.trim()} onClick={() => handleCreateFolder(folderName)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
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

      {/* Move to folder dialog */}
      {reparentTarget !== null && (
        <MoveNoteDialog
          open
          onClose={() => setReparentTarget(null)}
          onConfirm={handleReparentConfirm}
          disabledFolderIds={disabledMoveDestFolderIds}
          dialogTitle={
            reparentTarget.folderIds.length + reparentTarget.noteIds.length > 1
              ? `Move ${reparentTarget.folderIds.length + reparentTarget.noteIds.length} items`
              : 'Move to folder'
          }
          helperText={
            reparentTarget.folderIds.length >= 2
              ? 'If you selected a folder and its subfolders, only the top folder is moved; children stay attached.'
              : undefined
          }
        />
      )}
    </>
  );
};
