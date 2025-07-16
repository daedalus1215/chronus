import api from "./axios.interceptor";

type TimeTrack = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

export const getNoteTimeTracks = async (noteId: number): Promise<TimeTrack[]> => {
  const { data } = await api.get(`/time-tracks/note/${noteId}`);
  return data;
};

export const getTimeTracksTotalByNoteId = async (noteId: number) => {
  const { data } = await api.get(`/time-tracks/note/${noteId}/total`);
  return data;
};

export const deleteTimeTrack = async (id: number): Promise<void> => {
  await api.delete(`/time-tracks/${id}`);
}; 