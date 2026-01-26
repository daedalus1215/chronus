export type NoteTimeTracksResponse = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

export type TimeTrackAggregationResponse = {
  noteId: number;
  noteName: string;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

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
