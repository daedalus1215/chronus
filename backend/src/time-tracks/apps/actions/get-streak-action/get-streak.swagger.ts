import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetStreakSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary:
    'Get the current activity streak (consecutive days with time tracked)',
  additionalResponses: [
    {
      status: 200,
      description: 'The current streak count.',
    },
  ],
};
