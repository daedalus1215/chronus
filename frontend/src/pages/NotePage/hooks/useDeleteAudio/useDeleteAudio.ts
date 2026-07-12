import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteAudio,
  NoteAudio,
} from '../../../../api/requests/audio.requests';

type NoteAudiosResponse = {
  audios: NoteAudio[];
};

type DeleteAudioMutationContext = {
  previousAudiosResponse?: NoteAudiosResponse;
};

const createNoteAudiosQueryKey = (
  noteId: number
): readonly [string, number] => {
  return ['noteAudios', noteId] as const;
};

export const useDeleteAudio = (noteId: number) => {
  const queryClient = useQueryClient();
  const noteAudiosQueryKey = createNoteAudiosQueryKey(noteId);
  return useMutation<void, Error, number, DeleteAudioMutationContext>({
    mutationFn: (audioId: number) => deleteAudio(audioId),
    onMutate: async (audioId: number) => {
      await queryClient.cancelQueries({ queryKey: noteAudiosQueryKey });
      const previousAudiosResponse =
        queryClient.getQueryData<NoteAudiosResponse>(noteAudiosQueryKey);
      queryClient.setQueryData<NoteAudiosResponse | undefined>(
        noteAudiosQueryKey,
        oldAudiosResponse => {
          if (!oldAudiosResponse) {
            return oldAudiosResponse;
          }
          return {
            ...oldAudiosResponse,
            audios: oldAudiosResponse.audios.filter(
              audio => audio.id !== audioId
            ),
          };
        }
      );
      return { previousAudiosResponse };
    },
    onError: (
      _error: Error,
      _audioId: number,
      context?: DeleteAudioMutationContext
    ) => {
      if (context?.previousAudiosResponse) {
        queryClient.setQueryData(
          noteAudiosQueryKey,
          context.previousAudiosResponse
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: noteAudiosQueryKey });
    },
  });
};
