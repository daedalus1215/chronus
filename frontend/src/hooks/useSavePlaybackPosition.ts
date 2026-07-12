import { useMutation } from '@tanstack/react-query';
import { updatePlaybackPosition } from '../api/requests/audio.requests';

export const useSavePlaybackPosition = () => {
  return useMutation({
    mutationFn: ({
      audioId,
      positionSeconds,
      durationSeconds,
    }: {
      audioId: number;
      positionSeconds: number;
      durationSeconds?: number;
    }) => updatePlaybackPosition(audioId, positionSeconds, durationSeconds),
  });
};
