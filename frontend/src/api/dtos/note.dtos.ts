export type NamesOfNotesResponse = {
  notes: { name: string; id: number; isMemo: number }[];
  hasMore: boolean;
  nextCursor: number;
};

export type NoteResponse = {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
};

export type CreateTimeTrackRequest = {
  date: string;
  startTime: string;
  durationMinutes: number;
  noteId: number;
  note?: string;
};

export type CreateTimeTrackResponse = {
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
