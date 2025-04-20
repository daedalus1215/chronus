import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

export const GetTimeTracksByNoteIdSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get all time track entries for a specific note',
  additionalResponses: [
    {
      status: 200,
      description: 'List of time track entries for the note.',
      type: [TimeTrack]
    },
    {
      status: 404,
      description: 'Note not found.'
    }
  ]
}; 