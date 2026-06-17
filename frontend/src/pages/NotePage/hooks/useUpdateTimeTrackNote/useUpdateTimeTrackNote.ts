import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTimeTrackNote } from '../../../../api/requests/time-tracks.requests';
import type { TimeTrack } from '../useNoteTimeTracks/useNoteTimeTracks';

type UpdateTimeTrackNoteInput = {
  id: number;
  note: string;
};

type UpdateTimeTrackNoteContext = {
  previousTimeTracks?: TimeTrack[];
};

const createTimeTracksQueryKey = (noteId: number): readonly [string, number] => {
  return ['timeTracks', noteId] as const;
};

export const useUpdateTimeTrackNote = (noteId: number) => {
  const queryClient = useQueryClient();
  const timeTracksQueryKey = createTimeTracksQueryKey(noteId);
  return useMutation<
    TimeTrack,
    Error,
    UpdateTimeTrackNoteInput,
    UpdateTimeTrackNoteContext
  >({
    mutationFn: ({ id, note }: UpdateTimeTrackNoteInput) =>
      updateTimeTrackNote(id, note),
    onMutate: async ({ id, note }: UpdateTimeTrackNoteInput) => {
      await queryClient.cancelQueries({ queryKey: timeTracksQueryKey });
      const previousTimeTracks =
        queryClient.getQueryData<TimeTrack[]>(timeTracksQueryKey);
      queryClient.setQueryData<TimeTrack[] | undefined>(
        timeTracksQueryKey,
        oldTimeTracks =>
          oldTimeTracks?.map(track =>
            track.id === id ? { ...track, note } : track
          )
      );
      return { previousTimeTracks };
    },
    onError: (
      _error: Error,
      _input: UpdateTimeTrackNoteInput,
      context?: UpdateTimeTrackNoteContext
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
