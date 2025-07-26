import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TimeTrackAggregationResponseDto } from '../../dtos/responses/time-track-aggregation.response.dto';

export const GetTimeTracksAggregationSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Get aggregated time tracks grouped by note ID for a specific date',
  additionalResponses: [
    {
      status: 200,
      description: 'List of time track aggregations grouped by note ID, sorted by most recent activity.',
      type: [TimeTrackAggregationResponseDto]
    },
    {
      status: 401,
      description: 'Unauthorized - Invalid or missing authentication token.'
    },
    {
      status: 403,
      description: 'Forbidden - User not authorized to access the requested notes.'
    }
  ]
}; 