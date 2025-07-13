import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';
import { Note } from '../../../api/dtos/note';

export const useArchiveNote = () => {
  const queryClient = useQueryClient();

  const archiveNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await api.patch<Note>(`/notes/${noteId}/archive`);
      return response.data;
    },
    onSuccess: (archivedNote) => {
      // Update the note in cache
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