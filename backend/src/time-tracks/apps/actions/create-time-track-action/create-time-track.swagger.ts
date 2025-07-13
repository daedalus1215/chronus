import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

export const CreateTimeTrackSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Create a new time track entry for a note',
  additionalResponses: [
    {
      status: 201,
      description: 'Time track entry created successfully.',
      type: TimeTrack
    },
    {
      status: 404,
      description: 'Note not found.'
    },
    {
      status: 400,
      description: 'Invalid time track data.'
    }
  ]
}; 