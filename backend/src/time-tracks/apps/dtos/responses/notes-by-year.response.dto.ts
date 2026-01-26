export type NotesByYearResponseDto = {
  years: Array<{
    year: number;
    notes: Array<{
      noteId: number;
      noteName: string;
      firstDate: string;
      lastDate: string;
      totalTimeMinutes: number;
      dateCount: number;
      tags: Array<{
        id: number;
        name: string;
      }>;
    }>;
  }>;
};
