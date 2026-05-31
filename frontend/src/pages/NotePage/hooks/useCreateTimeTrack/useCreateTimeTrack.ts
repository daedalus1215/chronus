import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTimeTrack } from '../../../../api/requests/time-tracks.requests';
import type { CreateTimeTrackRequest } from '../../../../api/dtos/note.dtos';

type CreateTimeTrackInput = Omit<CreateTimeTrackRequest, 'noteId'>;

const createTimeTracksQueryKey = (noteId: number): readonly [string, number] => {
  return ['timeTracks', noteId] as const;
};

const createTimeTracksTotalQueryKey = (
  noteId: number
): readonly [string, number] => {
  return ['timeTracksTotal', noteId] as const;
};

export const useCreateTimeTrack = (noteId: number) => {
  const queryClient = useQueryClient();
  const timeTracksQueryKey = createTimeTracksQueryKey(noteId);
  const timeTracksTotalQueryKey = createTimeTracksTotalQueryKey(noteId);
  return useMutation({
    mutationFn: (input: CreateTimeTrackInput) =>
      createTimeTrack({ ...input, noteId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: timeTracksQueryKey });
      await queryClient.invalidateQueries({ queryKey: timeTracksTotalQueryKey });
    },
  });
};
