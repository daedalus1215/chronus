import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdatePlaybackPositionSwagger: ProtectedActionOptions = {
  tag: 'Audio',
  summary: 'Update the last playback position for an audio file',
  additionalResponses: [
    {
      status: 204,
      description: 'Playback position updated successfully.',
    },
    {
      status: 403,
      description: 'Not authorized to access this audio.',
    },
    {
      status: 404,
      description: 'Audio file not found.',
    },
  ],
};
