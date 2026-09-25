import { useMutation } from '@tanstack/react-query';
import { pinNote as pinNoteRequest } from '../../../api/requests/notes.requests';

export const usePinNote = () => {
  const pinNoteMutation = useMutation({
    mutationFn: async (params: { noteId: number; pinned: boolean }) => {
      return await pinNoteRequest(params.noteId, params.pinned);
    },
  });

  const pinNote = async (noteId: number, pinned: boolean) => {
    return pinNoteMutation.mutateAsync({ noteId, pinned });
  };

  return {
    pinNote,
    isPinning: pinNoteMutation.isPending,
    error: pinNoteMutation.error?.message || null,
  };
};
