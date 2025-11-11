import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveNote as archiveNoteRequest } from '../../../api/requests/notes.requests';
import { Note } from '../../../api/dtos/note.dtos';

export const useArchiveNote = () => {
  const queryClient = useQueryClient();

  const archiveNoteMutation = useMutation({
    mutationFn: async (noteId: number): Promise<Note> => {
      return await archiveNoteRequest(noteId);
    },
    onSuccess: (archivedNote) => {
      // Update the note in cache
      //@TODO: Circle back to this
      queryClient.setQueryData(['note', archivedNote.id], archivedNote);
      
      // Invalidate the notes list to refresh it
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const archiveNote = async (noteId: number) => {
    return archiveNoteMutation.mutateAsync(noteId);
  };

  return {
    archiveNote,
    isArchiving: archiveNoteMutation.isPending,
    error: archiveNoteMutation.error?.message || null,
  };
}; 