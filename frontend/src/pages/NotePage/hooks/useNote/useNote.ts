import {
  useNoteQuery,
  useUpdateNoteMutation,
  UpdateNoteVariables,
} from './useNoteQueries';
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

  const updateNoteMutation = useUpdateNoteMutation();

  const updateNote = async (updatedNote: Partial<Note>) => {
    if (!note) return;
    // noteId is bound here, at call time, so a save flushed while navigating
    // away still lands on the note the edit was made in.
    const variables: UpdateNoteVariables = { noteId };
    if (updatedNote.description !== undefined)
      variables.description = updatedNote.description;
    if (updatedNote.tags !== undefined) variables.tags = updatedNote.tags;
    return updateNoteMutation.mutateAsync(variables);
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
