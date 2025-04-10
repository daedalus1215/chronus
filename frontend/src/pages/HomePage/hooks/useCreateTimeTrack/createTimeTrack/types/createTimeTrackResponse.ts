export type createTimeTrackResponse = {
  id: number;
  userId: string;
  noteId: number;
  noteReference?: {
    id: number;
    name: string;
  };
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

