import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';

export type TimeTrackForMerge = {
  id: number;
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

const fetchAllNoteTimeTracks = async (): Promise<TimeTrackForMerge[]> => {
  const { data } = await api.get<TimeTrackForMerge[]>('/time-tracks');
  return data ?? [];
};

export const useGetAllNoteTimeTracks = () => {
  return useQuery({
    queryKey: ['timeTracks'],
    queryFn: fetchAllNoteTimeTracks,
  });
};
