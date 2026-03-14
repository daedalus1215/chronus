import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const DeleteAudioSwagger: ProtectedActionOptions = {
  tag: 'Audio',
  summary: 'Delete a specific audio file for authenticated user',
  additionalResponses: [
    {
      status: 200,
      description: 'Audio file deleted successfully.',
    },
    {
      status: 403,
      description: 'Not authorized to delete this audio.',
    },
    {
      status: 404,
      description: 'Audio file not found.',
    },
    {
      status: 500,
      description: 'Internal server error - Failed to delete audio file.',
    },
  ],
};
