import { useQuery } from '@tanstack/react-query';
import { getDailyTimeTracksAggregation } from '../../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../../api/dtos/time-tracks.dtos';

export const useDailyTimeTracksAggregation = (
  date?: string,
  enabled: boolean = true
): {
  data: TimeTrackAggregationResponse[];
  isLoading: boolean;
  error: string | null;
} => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<TimeTrackAggregationResponse[]>({
    queryKey: ['dailyTimeTracksAggregation', date],
    queryFn: () => getDailyTimeTracksAggregation(date),
    enabled,
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
  };
};
