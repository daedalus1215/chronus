import { NOTE_TYPES } from '../../constant';
import api from '../axios.interceptor';
import { NamesOfNotesResponse, NoteResponse } from '../dtos/note.dtos';

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

export const createNote = async (
  type: keyof typeof NOTE_TYPES
): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>('/notes', {
    name: type === NOTE_TYPES.MEMO ? 'Memo' : 'Checklist',
    isMemo: type === NOTE_TYPES.MEMO,
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
    params: {
      cursor,
      limit,
      query,
      type,
      tagId,
    },
  });
  return response.data;
};
