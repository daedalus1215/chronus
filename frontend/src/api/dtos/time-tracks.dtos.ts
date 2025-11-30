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
