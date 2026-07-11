import api from '../../../api/axios.interceptor';

type TagResponse = {
  id: number;
  name: string;
  description?: string | null;
};

// Fetch tag names for a single note (used when building merge data).
export const fetchNoteTags = async (noteId: number): Promise<string[]> => {
  const { data } = await api.get<TagResponse[]>(`/tags/note/${noteId}`);
  return (data ?? []).map(tag => tag.name);
};
