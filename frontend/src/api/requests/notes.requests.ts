import { NOTE_TYPES, NoteTypes } from '../../constant';
import api from '../axios.interceptor';
import {
  ExplorerNoteItem,
  NamesOfNotesResponse,
  NoteResponse,
  SearchResult,
} from '../dtos/note.dtos';

export const updateNoteTimestamp = async (noteId: number): Promise<void> => {
  const response = await api.patch(`/notes/${noteId}/timestamp`);
  return response.data;
};

export const deleteNote = async (noteId: number): Promise<void> => {
  await api.delete(`/notes/${noteId}`);
};

export const archiveNote = async (noteId: number): Promise<NoteResponse> => {
  const response = await api.patch<NoteResponse>(`/notes/${noteId}/archive`);
  return response.data;
};

export const convertChecklistToMemo = async (
  noteId: number
): Promise<NoteResponse> => {
  const response = await api.patch<NoteResponse>(
    `/notes/${noteId}/convert-to-memo`
  );
  return response.data;
};

export const createNote = async (
  type: NoteTypes,
  folderId?: number | null
): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>('/notes', {
    name: type === NOTE_TYPES.MEMO ? 'Memo' : 'Checklist',
    isMemo: type === NOTE_TYPES.MEMO,
    folderId: folderId ?? undefined,
  });
  return response.data;
};

export const createMemoByName = async (name: string): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>('/notes', {
    name,
    isMemo: true,
  });
  return response.data;
};

export const getNamesOfNotes = async (
  cursor: number,
  limit: number = 20,
  query: string,
  type?: keyof typeof NOTE_TYPES,
  tagId?: string
): Promise<NamesOfNotesResponse> => {
  const response = await api.get<NamesOfNotesResponse>(`/notes/names`, {
    params: { cursor, limit, query, type, tagId },
  });
  return response.data;
};

export const getNotesForExplorer = async (
  folderId?: string
): Promise<ExplorerNoteItem[]> => {
  const response = await api.get<ExplorerNoteItem[]>(`/notes/explorer-names`, {
    params: { folderId },
  });
  return response.data;
};

export const moveNoteToFolder = async (
  noteId: number,
  folderId: number | null
): Promise<{ id: number; folderId: number | null }> => {
  const response = await api.patch(`/notes/${noteId}/folder`, { folderId });
  return response.data;
};

export const reorderNotes = async (data: {
  items: { id: number; sortOrder: number }[];
  folderId: number | null;
}): Promise<void> => {
  await api.patch('/notes/reorder', data);
};

export const searchNotes = async (
  query: string,
  options?: { includeArchived?: boolean }
): Promise<SearchResult[]> => {
  const response = await api.get<SearchResult[]>('/notes/search', {
    params: {
      query,
      includeArchived: options?.includeArchived ?? false,
    },
  });
  return response.data;
};

export const exportNote = async (noteId: number): Promise<Blob> => {
  const response = await api.get(`/notes/${noteId}/export`, {
    responseType: 'blob',
  });
  return response.data;
};

export const importNote = async (data: {
  version: number;
  name: string;
  description?: string;
  tags?: string[];
  checkItems?: Array<{
    name: string;
    description?: string | null;
    status: 'ready' | 'in_progress' | 'review' | 'done';
    order: number;
    doneDate?: string | null;
    archiveDate?: string | null;
  }>;
  timeTracks?: Array<{
    date: string;
    startTime: string;
    durationMinutes: number;
  }>;
}): Promise<{ noteId: number }> => {
  const response = await api.post<{ noteId: number }>('/notes/import', data);
  return response.data;
};

export const mergeIntoNote = async (
  noteId: number,
  data: {
    version: number;
    description?: string;
    tags?: string[];
    checkItems?: Array<{
      name: string;
      description?: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate?: string | null;
      archiveDate?: string | null;
    }>;
    timeTracks?: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
      note?: string;
    }>;
  }
): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>(
    `/notes/${noteId}/merge`,
    data
  );
  return response.data;
};

export const mergeNotes = async (data: {
  targetNoteId: number;
  sources: Array<{
    noteId: number;
    name: string;
    description?: string;
    tags?: string[];
    checkItems?: Array<{
      name: string;
      description?: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate?: string | null;
      archiveDate?: string | null;
    }>;
    timeTracks?: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
      note?: string;
    }>;
  }>;
  version: number;
}): Promise<{ success: boolean; archivedNoteIds: number[] }> => {
  const response = await api.post<{
    success: boolean;
    archivedNoteIds: number[];
  }>('/notes/merge', data);
  return response.data;
};
