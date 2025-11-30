import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';

export type Tag = {
  id: number;
  name: string;
  description?: string;
};

export const useNoteTags = (noteId: number) => {
  const fetchTags = async (): Promise<Tag[]> => {
    const { data } = await api.get(`/tags/note/${noteId}`);
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['noteTags', noteId],
    queryFn: fetchTags,
    enabled: !!noteId,
  });

  const removeTagFromNote = async (dto: { tagId: number; noteId: number }) => {
    await api.delete(`/tags/${dto.tagId}/remove-from-note/notes/${dto.noteId}`);
    await refetch();
  };

  return {
    tags: data || [],
    loading: isLoading,
    error,
    refetch,
    removeTagFromNote,
  };
};
