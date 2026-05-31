import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTimeTrack } from '../../../../api/requests/time-tracks.requests';
import type { TimeTrack } from '../useNoteTimeTracks/useNoteTimeTracks';

type DeleteTimeTrackMutationContext = {
  previousTimeTracks?: TimeTrack[];
};

const createTimeTracksQueryKey = (noteId: number): readonly [string, number] => {
  return ['timeTracks', noteId] as const;
};

const createTimeTracksTotalQueryKey = (
  noteId: number
): readonly [string, number] => {
  return ['timeTracksTotal', noteId] as const;
};

export const useDeleteTimeTrack = (noteId: number) => {
  const queryClient = useQueryClient();
  const timeTracksQueryKey = createTimeTracksQueryKey(noteId);
  const timeTracksTotalQueryKey = createTimeTracksTotalQueryKey(noteId);
  return useMutation<void, Error, number, DeleteTimeTrackMutationContext>({
    mutationFn: (timeTrackId: number) => deleteTimeTrack(timeTrackId),
    onMutate: async (timeTrackId: number) => {
      await queryClient.cancelQueries({ queryKey: timeTracksQueryKey });
      const previousTimeTracks = queryClient.getQueryData<TimeTrack[]>(
        timeTracksQueryKey
      );
      queryClient.setQueryData<TimeTrack[] | undefined>(
        timeTracksQueryKey,
        oldTimeTracks => {
          if (!oldTimeTracks) {
            return oldTimeTracks;
          }
          return oldTimeTracks.filter(track => track.id !== timeTrackId);
        }
      );
      return { previousTimeTracks };
    },
    onError: (
      _error: Error,
      _timeTrackId: number,
      context?: DeleteTimeTrackMutationContext
    ) => {
      if (context?.previousTimeTracks) {
        queryClient.setQueryData(timeTracksQueryKey, context.previousTimeTracks);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: timeTracksQueryKey });
      await queryClient.invalidateQueries({ queryKey: timeTracksTotalQueryKey });
    },
  });
};
