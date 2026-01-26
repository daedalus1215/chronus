import { useQuery } from '@tanstack/react-query';
import { getNotesByYear } from '../../../api/requests/time-tracks.requests';
import { NotesByYearResponseDto } from '../../../api/dtos/time-tracks.dtos';

export const useNotesByYear = () => {
  return useQuery<NotesByYearResponseDto, Error>({
    queryKey: ['notesByYear'],
    queryFn: getNotesByYear,
  });
};
