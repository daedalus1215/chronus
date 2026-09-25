import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchTags } from '../api/requests/tags.requests';
import { getNamesOfNotes } from '../api/requests/notes.requests';
import { Tag } from '../api/dtos/tag.dtos';

export type NoteSummary = {
  id: number;
  name: string;
  pinned?: boolean;
};

export const useTagsWithNotes = () => {
  const {
    data: tags = [],
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const fetchNotesForTag = useCallback(
    async (tagId: number): Promise<NoteSummary[]> => {
      const response = await getNamesOfNotes(
        0,
        100,
        '',
        undefined,
        String(tagId)
      );
      return response.notes.map(note => ({
        id: note.id,
        name: note.name,
        pinned: Boolean(note.pinned),
      }));
    },
    []
  );

  return {
    tags,
    tagsLoading,
    tagsError,
    fetchNotesForTag,
  };
};
