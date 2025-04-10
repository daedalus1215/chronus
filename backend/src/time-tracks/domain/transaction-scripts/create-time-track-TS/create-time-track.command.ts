export type CreateTimeTrackCommand = {  
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  user: {
    id: string;
    username: string;
  }
} 