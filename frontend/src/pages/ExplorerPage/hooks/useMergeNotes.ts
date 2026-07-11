import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeNotes as mergeNotesRequest } from '../../../api/requests/notes.requests';

export type SourceNoteSelection = {
  noteId: number;
  name: string;
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
    note?: string;
  }>;
};

export type MergeNotesData = {
  targetNoteId: number;
  sources: SourceNoteSelection[];
  version: number;
};

export const useMergeNotes = () => {
  const queryClient = useQueryClient();

  const mergeMutation = useMutation({
    mutationFn: async (data: MergeNotesData): Promise<{ success: boolean; archivedNoteIds: number[] }> => {
      return await mergeNotesRequest(data);
    },
    onSuccess: () => {
      // Refresh all affected data
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['checkItems'] });
      queryClient.invalidateQueries({ queryKey: ['noteTags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['timeTracks'] });
      queryClient.invalidateQueries({ queryKey: ['timeTracksTotal'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const mergeNotes = async (data: MergeNotesData) => {
    return await mergeMutation.mutateAsync(data);
  };

  return {
    mergeNotes,
    isMerging: mergeMutation.isPending,
    error: mergeMutation.error?.message || null,
  };
};
