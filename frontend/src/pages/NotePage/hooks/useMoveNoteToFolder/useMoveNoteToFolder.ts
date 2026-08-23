import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveNoteToFolder } from '../../../../api/requests/notes.requests';
import { noteKeys } from '../useNote/useNoteQueries';
import { Note } from '../../api/responses';
import { FolderDto } from '../../../../api/dtos/folder.dtos';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Failed to move note to folder';
}

/**
 * Moves the note into a folder (null = root). On success the note-detail
 * cache entry is patched in place so the sidebar status row and the
 * dialog pre-selection update without a refetch. On failure the error
 * string is exposed and the caller keeps the dialog open.
 */
export const useMoveNoteToFolder = (noteId: number) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (folder: FolderDto | null) =>
      moveNoteToFolder(noteId, folder?.id ?? null),
    onSuccess: (result, folder) => {
      queryClient.setQueryData<Note>(noteKeys.detail(noteId), prev => {
        if (!prev) return prev;
        return { ...prev, folderId: result.folderId };
      });
      setSnackbarMessage(
        folder ? `Moved to ${folder.name}` : 'Removed from folder'
      );
      setError(null);
    },
    onError: err => {
      setError(extractErrorMessage(err));
    },
  });

  const moveNote = async (folder: FolderDto | null): Promise<void> => {
    setError(null);
    await mutation.mutateAsync(folder);
  };

  return {
    moveNote,
    isPending: mutation.isPending,
    error,
    clearError: () => setError(null),
    snackbarMessage,
    closeSnackbar: () => setSnackbarMessage(null),
  };
};
