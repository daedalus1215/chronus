import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Snackbar,
  SnackbarContent,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import { MoveNoteDialog } from '../../../../components/MoveNoteDialog/MoveNoteDialog';
import { useFolders } from '../../../../hooks/useFolders/useFolders';
import { useMoveNoteToFolder } from '../../hooks/useMoveNoteToFolder/useMoveNoteToFolder';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import styles from './SidebarFolderView.module.css';

type SidebarFolderViewProps = {
  noteId: number;
  folderId: number | null;
};

export const SidebarFolderView: React.FC<SidebarFolderViewProps> = ({
  noteId,
  folderId,
}) => {
  const { data: folders, isLoading } = useFolders();
  const {
    moveNote,
    isPending,
    error,
    clearError,
    snackbarMessage,
    closeSnackbar,
  } = useMoveNoteToFolder(noteId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentFolder = useMemo(
    () => folders?.find(f => f.id === folderId) ?? null,
    [folders, folderId]
  );

  const statusText = isLoading
    ? '…'
    : folderId === null
      ? 'No folder'
      : currentFolder
        ? `In folder: ${currentFolder.name}`
        : 'Current folder no longer exists — pick a new one.';

  const handleOpenDialog = () => {
    clearError();
    setIsDialogOpen(true);
  };

  const handleConfirm = async (folder: FolderDto | null) => {
    try {
      await moveNote(folder);
      setIsDialogOpen(false);
    } catch {
      // Error is exposed via the hook; the dialog stays open with the
      // message and the user can retry.
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    clearError();
  };

  return (
    <div className={styles.sidebarFolder}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FolderIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {statusText}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        disabled={isPending}
        onClick={handleOpenDialog}
      >
        Move to folder…
      </Button>
      <MoveNoteDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
        currentFolderId={folderId}
        error={error}
      />
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <SnackbarContent message={snackbarMessage ?? ''} />
      </Snackbar>
    </div>
  );
};
