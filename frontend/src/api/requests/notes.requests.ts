import { NOTE_TYPES, NoteTypes } from '../../constant';
import api from '../axios.interceptor';
import { ExplorerNoteItem, NamesOfNotesResponse, NoteResponse, SearchResult } from '../dtos/note.dtos';

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

export const searchNotes = async (query: string): Promise<SearchResult[]> => {
  const response = await api.get<SearchResult[]>('/notes/search', {
    params: { query },
  });
  return response.data;
};
