import api from "./axios.interceptor";

export const getTimeTracksTotalByNoteId = async (noteId: number): Promise<number> => {
  const { data } = await api.get(`/time-tracks/total/${noteId}`);
  return data.total;
};

export const deleteTimeTrack = async (id: number): Promise<void> => {
  await api.delete(`/time-tracks/${id}`);
}; 