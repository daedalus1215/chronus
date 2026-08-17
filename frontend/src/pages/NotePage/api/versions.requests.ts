import api from '../../../api/axios.interceptor';

export type NoteVersion = {
  id: number;
  versionNum: number;
  description: string;
  createdAt: string;
};

export type NoteVersionsResponse = {
  versions: NoteVersion[];
  total: number;
};

export const fetchNoteVersions = async (
  noteId: number
): Promise<NoteVersionsResponse> => {
  const response = await api.get<NoteVersionsResponse>(`/notes/${noteId}/versions`);
  return response.data;
};

export const loadNoteVersion = async (
  noteId: number,
  versionId: number
): Promise<{ id: number; name: string; description: string; isMemo: boolean }> => {
  const response = await api.post(
    `/notes/${noteId}/versions/${versionId}/load`
  );
  return response.data;
};
