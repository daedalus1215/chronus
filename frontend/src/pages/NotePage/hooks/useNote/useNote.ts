import { useNoteQuery, useUpdateNoteMutation } from './useNoteQueries';
import { Note } from '../../api/responses';

export const useNote = (noteId: number) => {
  const {
    data: note = {
      id: 0,
      name: '',
      userId: '',
      isMemo: false,
      createdAt: '',
      updatedAt: '',
      tags: [],
    },
    isLoading,
    error,
    refetch,
  } = useNoteQuery(noteId);

  const updateNoteMutation = useUpdateNoteMutation(noteId);

  const updateNote = async (updatedNote: Partial<Note>) => {
    if (!note) return;
    return updateNoteMutation.mutateAsync(updatedNote);
  };

  return {
    note,
    isLoading,
    error: error?.message || null,
    updateNote,
    refetch,
    isUpdating: updateNoteMutation.isPending,
    updateError: updateNoteMutation.error?.message || null,
  };
};
