import { useQuery } from '@tanstack/react-query';
import {
  getNoteTimeTracks,
  getTimeTracksTotalByNoteId,
} from '../../../../api/requests/time-tracks.requests';
import { TimeTrackTotalResponseDto } from '../../../../api/dtos/note.dtos';

export type TimeTrack = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

const createTimeTracksQueryKey = (noteId: number): readonly [string, number] => {
  return ['timeTracks', noteId] as const;
};

const createTimeTracksTotalQueryKey = (
  noteId: number
): readonly [string, number] => {
  return ['timeTracksTotal', noteId] as const;
};

export const useNoteTimeTracks = (noteId: number) => {
  const timeTracksQueryKey = createTimeTracksQueryKey(noteId);
  const timeTracksTotalQueryKey = createTimeTracksTotalQueryKey(noteId);
  const {
    data: timeTracks = [],
    isLoading: isLoadingTimeTracks,
    error: timeTracksError,
    refetch,
  } = useQuery({
    queryKey: timeTracksQueryKey,
    queryFn: () => getNoteTimeTracks(noteId),
    enabled: !!noteId,
  });
  const {
    data: totalTimeData = null,
    isLoading: isLoadingTotal,
    error: totalError,
  } = useQuery<TimeTrackTotalResponseDto>({
    queryKey: timeTracksTotalQueryKey,
    queryFn: () => getTimeTracksTotalByNoteId(noteId),
    enabled: !!noteId,
  });
  const timeTrackError = (timeTracksError || totalError)?.message ?? null;
  return {
    timeTracks,
    isLoadingTimeTracks,
    isLoadingTotal,
    timeTrackError,
    totalTimeData,
    refetch,
  };
};
