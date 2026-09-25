import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { getNamesOfNotes } from '../../../api/requests/notes.requests';
import { NOTE_TYPES } from '../../../constant';

export const useNotes = (type?: keyof typeof NOTE_TYPES, tagId?: string) => {
  const [notes, setNotes] = useState<
    {
      name: string;
      id: number;
      isMemo: number;
      folderId: number | null;
      pinned: boolean;
    }[]
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

        const response = await getNamesOfNotes(cursor, 100, query, type, tagId);
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

  // Pinned notes keep their server-defined position (pinned_at order);
  // click-to-top only reorders the unpinned section, inserting right below
  // the pinned block.
  const moveNoteToTop = useCallback((noteId: number) => {
    setNotes(prevNotes => {
      const noteIndex = prevNotes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) {
        return prevNotes;
      }
      const clickedNote = prevNotes[noteIndex];
      if (clickedNote.pinned) {
        return prevNotes;
      }
      const pinnedCount = prevNotes.filter(note => note.pinned).length;
      if (pinnedCount === 0) {
        if (noteIndex === 0) {
          return prevNotes;
        }
        const otherNotes = prevNotes.filter(note => note.id !== noteId);
        return [clickedNote, ...otherNotes];
      }
      if (noteIndex === pinnedCount) {
        return prevNotes;
      }
      const otherNotes = prevNotes.filter(note => note.id !== noteId);
      return [
        ...otherNotes.slice(0, pinnedCount),
        clickedNote,
        ...otherNotes.slice(pinnedCount),
      ];
    });
  }, []);

  const setPinned = useCallback((noteId: number, pinned: boolean) => {
    setNotes(prevNotes => {
      const target = prevNotes.find(note => note.id === noteId);
      if (!target) {
        return prevNotes;
      }
      const otherNotes = prevNotes.filter(note => note.id !== noteId);
      if (pinned) {
        return [{ ...target, pinned: true }, ...otherNotes];
      }
      // Unpin: drop to the top of the unpinned section. The server keeps the
      // note's updated_at, so the next fetch settles its exact position.
      const pinnedCount = otherNotes.filter(note => note.pinned).length;
      return [
        ...otherNotes.slice(0, pinnedCount),
        { ...target, pinned: false },
        ...otherNotes.slice(pinnedCount),
      ];
    });
  }, []);

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
    moveNoteToTop,
    setPinned,
  };
};
