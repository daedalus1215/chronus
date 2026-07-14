import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TimeTrackWithNoteResponse } from '../../dtos/responses/time-track-with-note.response.dto';

export const GetTimeTracksByDateRangeSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get raw individual time tracks within a date range',
  additionalResponses: [
    {
      status: 200,
      description: 'Time tracks within the date range.',
      type: [TimeTrackWithNoteResponse],
    },
  ],
};
