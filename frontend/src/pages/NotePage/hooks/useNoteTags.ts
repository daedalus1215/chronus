import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios.interceptor";

export type Tag = {
  id: string;
  name: string;
  description?: string;
};

export const useNoteTags = (noteId: number) => {
  const fetchTags = async (): Promise<Tag[]> => {
    const { data } = await api.get(`/tags/note/${noteId}`);
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery(
    {
      queryKey: ["noteTags", noteId],
      queryFn: fetchTags,
      enabled: !!noteId,
    }
  );

  return {
    tags: data || [],
    loading: isLoading,
    error,
    refetch,
  };
};
