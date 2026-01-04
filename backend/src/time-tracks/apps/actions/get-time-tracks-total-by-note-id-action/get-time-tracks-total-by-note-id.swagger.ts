import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetTimeTracksTotalByNoteIdSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get total time tracked for a specific note',
  additionalResponses: [
    {
      status: 200,
      description: 'Total time tracked in minutes for the note.',
      type: Number,
    },
    {
      status: 404,
      description: 'Note not found.',
    },
  ],
};
