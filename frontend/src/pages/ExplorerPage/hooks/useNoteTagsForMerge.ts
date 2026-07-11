import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';

export type NoteTagForMerge = {
  noteId: number;
  tag: {
    id: number;
    name: string;
  };
};

const fetchAllNoteTags = async (): Promise<NoteTagForMerge[]> => {
  const { data } = await api.get<NoteTagForMerge[]>('/note-tags');
  return data ?? [];
};

export const useGetAllNoteTags = () => {
  return useQuery({
    queryKey: ['noteTags'],
    queryFn: fetchAllNoteTags,
  });
};
