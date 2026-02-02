import { useNotes } from '../../HomePage/hooks/useNotes';

/**
 * Fetches notes associated with a tag. Wraps useNotes with tagId.
 * Use when tagId is defined (e.g. from /tag-notes/:tagId).
 */
export const useNotesForTag = (tagId: string | undefined) => {
  return useNotes(undefined, tagId);
};
