import { useQuery } from '@tanstack/react-query';
import { fetchTags } from '../../../api/requests/tags.requests';

export const useAllTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });
};
