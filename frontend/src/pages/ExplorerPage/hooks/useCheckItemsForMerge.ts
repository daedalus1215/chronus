import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';

export type CheckItem = {
  id: number;
  noteId: number;
  name: string;
  description?: string | null;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  order: number;
  doneDate?: string | null;
  archiveDate?: string | null;
};

const fetchAllNoteCheckItems = async (): Promise<CheckItem[]> => {
  const { data } = await api.get<CheckItem[]>('/check-items');
  return data ?? [];
};

export const useGetAllNoteCheckItems = () => {
  return useQuery({
    queryKey: ['checkItems'],
    queryFn: fetchAllNoteCheckItems,
  });
};
