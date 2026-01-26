import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetNotesByYearSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get notes worked on grouped by year',
  additionalResponses: [
    {
      status: 200,
      description: 'Notes grouped by year with time track metadata.',
    },
  ],
};
