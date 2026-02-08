import api from '../axios.interceptor';

export interface NoteAudio {
  id: number;
  noteId: number;
  filePath: string;
  fileName: string;
  fileFormat: string;
  createdAt: string;
  updatedAt: string;
}

export const convertTextToSpeech = async (assetId: number) => {
  const response = await api.post(`/audio/text-to-speech`, { assetId });
  return response.data;
};

export const downloadAudio = async (audioId: number) => {
  const response = await api.get(`/audio/download/${audioId}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getNoteAudios = async (noteId: number): Promise<{ audios: NoteAudio[] }> => {
  const response = await api.get(`/audio/note/${noteId}`);
  return response.data;
};
