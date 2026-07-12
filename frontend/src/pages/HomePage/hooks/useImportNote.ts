import { useMutation } from '@tanstack/react-query';
import { importNote as importNoteRequest } from '../../../api/requests/notes.requests';

export type ImportNoteData = {
  version: number;
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
  }>;
};

export const useImportNote = () => {
  const importNoteMutation = useMutation({
    mutationFn: async (data: ImportNoteData): Promise<{ noteId: number }> => {
      return await importNoteRequest(data);
    },
  });

  const importNote = async (data: ImportNoteData) => {
    return await importNoteMutation.mutateAsync(data);
  };

  return {
    importNote,
    isImporting: importNoteMutation.isPending,
    error: importNoteMutation.error?.message || null,
  };
};
