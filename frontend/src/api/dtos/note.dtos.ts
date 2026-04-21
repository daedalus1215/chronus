export type NoteNameItem = {
  name: string;
  id: number;
  isMemo: number;
};

export type NamesOfNotesResponse = {
  notes: NoteNameItem[];
  hasMore: boolean;
  nextCursor: number;
};

export type ExplorerNoteItem = {
  name: string;
  id: number;
  isMemo: number;
  folderId: number | null;
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

export type SearchResult = {
  noteId: number;
  noteName: string;
  isMemo: boolean;
  matchType: 'note_name' | 'memo_content' | 'check_item';
  contextBefore: string;
  matchText: string;
  contextAfter: string;
};

export type TimeTrackTotalResponseDto = {
  totalMinutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutesRemainder: number;
};
