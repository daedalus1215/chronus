import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetWeeklyTrendSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get daily time totals for the past 7 days',
  additionalResponses: [
    {
      status: 200,
      description: 'Daily time totals for the past 7 days.',
    },
  ],
};
