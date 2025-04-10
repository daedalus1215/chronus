export type CreateTimeTrackRequest = {
  date: string;
  startTime: string;
  durationMinutes: number;
  noteId: number;
  note?: string;
}; 