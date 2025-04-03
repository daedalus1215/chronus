export type CreateTimeTrackCommand = {  
  noteId: number;
  userId: string;
  date: Date;
  startTime: string;
  durationMinutes: number;
  note?: string;
} 