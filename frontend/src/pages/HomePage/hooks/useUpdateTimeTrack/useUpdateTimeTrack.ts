import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTimeTrack } from '../../../../api/requests/time-tracks.requests';
import type { TimeTrack } from '../useNoteTimeTracks/useNoteTimeTracks';

type UpdateTimeTrackPayload = {
  date?: string;
  startTime?: string;
  durationMinutes?: number;
  noteId?: number;
  note?: string;
};

type UpdateTimeTrackInput = {
  id: number;
  payload: UpdateTimeTrackPayload;
};

type UpdateTimeTrackContext = {
  previousTimeTracks?: TimeTrack[];
};

export const useUpdateTimeTrack = (noteId: number) => {
  const queryClient = useQueryClient();
  const timeTracksQueryKey = ['timeTracks', noteId] as const;

  return useMutation<
    TimeTrack,
    Error,
    UpdateTimeTrackInput,
    UpdateTimeTrackContext
  >({
    mutationFn: ({ id, payload }: UpdateTimeTrackInput) =>
      updateTimeTrack(id, payload),
    onMutate: async ({ id, payload }: UpdateTimeTrackInput) => {
      await queryClient.cancelQueries({ queryKey: timeTracksQueryKey });
      const previousTimeTracks =
        queryClient.getQueryData<TimeTrack[]>(timeTracksQueryKey);
      queryClient.setQueryData<TimeTrack[] | undefined>(
        timeTracksQueryKey,
        oldTimeTracks =>
          oldTimeTracks?.map(track =>
            track.id === id ? { ...track, ...payload } : track
          )
      );
      return { previousTimeTracks };
    },
    onError: (
      _error: Error,
      _input: UpdateTimeTrackInput,
      context?: UpdateTimeTrackContext
    ) => {
      if (context?.previousTimeTracks) {
        queryClient.setQueryData(
          timeTracksQueryKey,
          context.previousTimeTracks
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: timeTracksQueryKey });
    },
  });
};
