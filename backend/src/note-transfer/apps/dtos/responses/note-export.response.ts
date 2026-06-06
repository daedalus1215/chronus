export type NoteExportResponse = {
  version: number;
  exportedAt: string;
  memo: {
    name: string;
    description: string;
    tags: string[];
    checkItems: Array<{
      name: string;
      description: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate: string | null;
      archiveDate: string | null;
    }>;
    timeTracks: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
    }>;
  };
};