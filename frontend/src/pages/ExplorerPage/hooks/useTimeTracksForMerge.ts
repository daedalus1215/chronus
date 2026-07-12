import api from '../../../api/axios.interceptor';

type NoteTimeTrackResponse = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string | null;
};

export type TimeTrackForMerge = {
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

// Fetch time tracks for a single note (used when building merge data).
export const fetchNoteTimeTracks = async (
  noteId: number
): Promise<TimeTrackForMerge[]> => {
  const { data } = await api.get<NoteTimeTrackResponse[]>(
    `/time-tracks/note/${noteId}`
  );
  return (data ?? []).map(track => ({
    date: track.date,
    startTime: track.startTime,
    durationMinutes: track.durationMinutes,
    note: track.note ?? undefined,
  }));
};
