import { useQuery } from "@tanstack/react-query";
import api from '../../../../api/axios.interceptor';
import { getTimeTracksTotalByNoteId } from "../../../../api/requests/time-tracks.requests";
import { TimeTrackTotalResponseDto } from "../../../../api/dtos/note.dtos";

export type TimeTrack = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

const fetchNoteTimeTracks = async (noteId: number): Promise<TimeTrack[]> => {
  const { data } = await api.get<TimeTrack[]>(`/time-tracks/note/${noteId}`);
  return data ?? [];
};

export const useNoteTimeTracks = (noteId: number, isOpen: boolean): {
  timeTracks: TimeTrack[];
  isLoadingTimeTracks: boolean;
  timeTrackError: string | null;
  totalTimeData: TimeTrackTotalResponseDto | null;
  isLoadingTotal: boolean;
} => {
  const {
    data: timeTracks = [],
    isLoading:isLoadingTimeTracks,
    error:timeTracksError,
  } = useQuery({
    queryKey: ["timeTracks", noteId],
    queryFn: () => fetchNoteTimeTracks(noteId),
    enabled: isOpen,
  });

  const {
    data: totalTimeData,
    isLoading: isLoadingTotal,
    error: totalError,
  } = useQuery<TimeTrackTotalResponseDto, Error, TimeTrackTotalResponseDto>({
    queryKey: ["timeTracksTotal", noteId],
    queryFn: () => getTimeTracksTotalByNoteId(noteId),
    enabled: isOpen,
  });

  const timeTrackError = (timeTracksError || totalError)?.message;

  return { timeTracks, isLoadingTimeTracks, timeTrackError, totalTimeData, isLoadingTotal };
}; 