import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FolderOutput } from 'lucide-react';
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

  useEffect(() => {
    if (snackbarMessage !== null) {
      toast.success(snackbarMessage);
      closeSnackbar();
    }
  }, [snackbarMessage, closeSnackbar]);

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
      <div className="mb-4 flex items-center gap-2">
        <FolderOutput className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{statusText}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
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
    </div>
  );
};
