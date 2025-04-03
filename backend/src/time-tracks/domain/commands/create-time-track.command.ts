export type CreateTimeTrackCommand = {
  noteId: number;
  date: Date;
  startTime: string;
  durationMinutes: number;
  note?: string;
  user: {
    id: string;
    username: string;
  }
} 