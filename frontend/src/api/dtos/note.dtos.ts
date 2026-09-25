export type NoteNameItem = {
  name: string;
  id: number;
  isMemo: number;
  folderId: number | null;
  pinned: boolean;
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
  sortOrder: number;
  pinned: boolean;
};

export type CheckItemResponse = {
  id: number;
  name: string;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  doneDate: string | null;
  archiveDate: string | null;
  noteId: number;
  order: number;
  description: string | null;
};

export type NoteResponse = {
  id: number;
  name: string;
  checkItems: CheckItemResponse[];
  description: string;
  isMemo: boolean;
  folderId: number | null;
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
  // NEW optional fields for check items
  checkItemId?: number;
  checkItemStatus?: 'ready' | 'in_progress' | 'review' | 'done';
  checkItemDescriptionSnippet?: string | null;
  checkItemIsArchived?: boolean;
};

export type TimeTrackTotalResponseDto = {
  totalMinutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutesRemainder: number;
};
