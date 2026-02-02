import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../api/axios.interceptor';
import { Note } from '../../api/responses';
import { fetchNoteById } from '../../api/requests';

// Query keys for better organization
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: number) => [...noteKeys.details(), id] as const,
};

export const useNoteQuery = (noteId: number) => {
  return useQuery({
    queryKey: noteKeys.detail(noteId),
    queryFn: async () => {
      const data = await fetchNoteById(noteId);
      await api.patch(`/notes/${noteId}/timestamp`);
      return data;
    },
    enabled: !!noteId,
    staleTime: 0, // Data is considered stale immediately
    gcTime: 0, // Data is garbage collected immediately (formerly cacheTime)
  });
};

export const useUpdateNoteMutation = (noteId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedNote: Partial<Note>) => {
      const body: Partial<Pick<Note, 'description' | 'tags'>> = {};
      if (updatedNote.description !== undefined) body.description = updatedNote.description;
      if (updatedNote.tags !== undefined) body.tags = updatedNote.tags;
      const response = await api.patch<Note>(`/notes/detail/${noteId}`, body);
      return response.data;
    },
    onSuccess: (responseData) => {
      queryClient.setQueryData(noteKeys.detail(noteId), (prev: Note | undefined) => {
        if (!prev) return responseData;
        const merged = { ...prev };
        (Object.keys(responseData) as (keyof Note)[]).forEach((key) => {
          if (responseData[key] !== undefined) {
            (merged as Record<keyof Note, unknown>)[key] = responseData[key];
          }
        });
        return merged;
      });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
};
