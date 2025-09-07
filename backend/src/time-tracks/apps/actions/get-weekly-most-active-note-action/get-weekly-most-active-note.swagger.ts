import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

export const GetWeeklyMostActiveNoteSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get the most active note for the current week',
  additionalResponses: [
    {
      status: 200,
      description: 'The most active note for the current week.',
      type: [TimeTrack]
    },
    {
      status: 404,
      description: 'No time tracks found for the current week.'
    }
  ]
}; 