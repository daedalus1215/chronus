import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const DownloadAudioSwagger: ProtectedActionOptions = {
  tag: 'Audio',
  summary: 'Download generated audio file for authenticated user',
  additionalResponses: [
    {
      status: 200,
      description: 'The audio file stream.',
      type: 'application/octet-stream'
    },
    {
      status: 404,
      description: 'Audio file not found.'
    },
    {
      status: 500,
      description: 'Internal server error - Failed to download audio file.'
    }
  ]
};
