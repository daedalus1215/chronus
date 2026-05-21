import { useMutation } from '@tanstack/react-query';
import { updatePlaybackPosition } from '../api/requests/audio.requests';

export const useSavePlaybackPosition = () => {
  return useMutation({
    mutationFn: ({
      audioId,
      positionSeconds,
    }: {
      audioId: number;
      positionSeconds: number;
    }) => updatePlaybackPosition(audioId, positionSeconds),
  });
};
