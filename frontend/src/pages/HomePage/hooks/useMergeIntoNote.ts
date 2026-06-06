import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeIntoNote as mergeIntoNoteRequest } from '../../../api/requests/notes.requests';

export type MergeIntoNoteData = {
  version: number;
  description?: string;
  tags?: string[];
  checkItems?: Array<{
    name: string;
    description?: string | null;
    status: 'ready' | 'in_progress' | 'review' | 'done';
    order: number;
    doneDate?: string | null;
    archiveDate?: string | null;
  }>;
  timeTracks?: Array<{
    date: string;
    startTime: string;
    durationMinutes: number;
  }>;
};

export const useMergeIntoNote = (noteId: number) => {
  const queryClient = useQueryClient();

  const mergeMutation = useMutation({
    mutationFn: async (data: MergeIntoNoteData): Promise<{ success: boolean }> => {
      return await mergeIntoNoteRequest(noteId, data);
    },
    onSuccess: () => {
      // Refresh every part of the memo view the merge may have touched.
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['checkItems'] });
      queryClient.invalidateQueries({ queryKey: ['noteTags', noteId] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['timeTracks', noteId] });
      queryClient.invalidateQueries({ queryKey: ['timeTracksTotal', noteId] });
    },
  });

  const mergeIntoNote = async (data: MergeIntoNoteData) => {
    return await mergeMutation.mutateAsync(data);
  };

  return {
    mergeIntoNote,
    isMerging: mergeMutation.isPending,
    error: mergeMutation.error?.message || null,
  };
};
