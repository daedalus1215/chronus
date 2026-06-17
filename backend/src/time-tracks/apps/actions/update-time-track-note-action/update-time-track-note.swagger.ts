import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateTimeTrackNoteSwagger: ProtectedActionOptions = {
  tag: 'time-tracks',
  summary: 'Update the note on a time track by id',
  additionalResponses: [
    { status: 404, description: 'Time track not found or not owned by user' },
  ],
};
