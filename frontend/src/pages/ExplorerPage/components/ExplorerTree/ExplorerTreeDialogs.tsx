import React from 'react';
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
  newFolderName: string;
  setNewFolderName: (v: string) => void;
  handleCreateFolder: () => void;

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
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  deleteConfirmId,
  setDeleteConfirmId,
  handleDeleteFolder,
  reparentTarget,
  setReparentTarget,
  handleReparentConfirm,
  disabledMoveDestFolderIds,
}) => {
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
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderParentId(undefined)}>Cancel</Button>
          <Button variant="contained" disabled={!newFolderName.trim()} onClick={handleCreateFolder}>
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
