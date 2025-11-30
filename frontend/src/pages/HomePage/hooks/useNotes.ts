import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { getNamesOfNotes } from '../../../api/requests/notes.requests';
import { NOTE_TYPES } from '../../../constant';

export const useNotes = (type?: keyof typeof NOTE_TYPES, tagId?: string) => {
  const [notes, setNotes] = useState<
    { name: string; id: number; isMemo: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingChanges] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const fetchNotes = useCallback(
    async (cursor: number = 0, query: string = '') => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getNamesOfNotes(cursor, 20, query, type, tagId);

        if (cursor > 0) {
          setNotes(prev => [...prev, ...response.notes]);
        } else {
          setNotes(response.notes);
        }

        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to fetch notes');
      } finally {
        setIsLoading(false);
      }
    },
    [type, tagId]
  );

  const searchNotes = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchNotes(0);
  }, [fetchNotes]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotes(nextCursor, searchQuery);
    }
  }, [hasMore, isLoading, nextCursor, fetchNotes, searchQuery]);

  // Single effect for both initial load and search
  useEffect(() => {
    fetchNotes(0, debouncedSearchQuery);
  }, [fetchNotes, debouncedSearchQuery]);

  return {
    notes,
    isLoading,
    error,
    hasPendingChanges,
    hasMore,
    refreshNotes: () => fetchNotes(0, searchQuery),
    loadMore,
    searchNotes,
    clearSearch,
    searchQuery,
  };
};
