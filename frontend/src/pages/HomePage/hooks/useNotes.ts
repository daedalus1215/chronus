import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios.interceptor';

type NoteResponse = {
  notes: {name: string, id: number}[];
  hasMore: boolean;
  nextCursor: number;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<{name: string, id: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingChanges] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number>(0);

  const fetchNotes = useCallback(async (cursor: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching notes with cursor:', cursor);

      const response = await api.get<NoteResponse>('/notes/names', {
        params: { cursor, limit: 20 }
      });
      
      console.log('Response:', { 
        notesCount: response.data.notes.length,
        hasMore: response.data.hasMore,
        nextCursor: response.data.nextCursor 
      });
      
      if (cursor > 0) {
        setNotes(prev => [...prev, ...response.data.notes]);
      } else {
        setNotes(response.data.notes);
      }
      
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.nextCursor);
      
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    console.log('loadMore called:', { hasMore, isLoading, nextCursor });
    if (hasMore && !isLoading) {
      fetchNotes(nextCursor);
    }
  }, [hasMore, isLoading, nextCursor, fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    hasPendingChanges,
    hasMore,
    refreshNotes: () => fetchNotes(0),
    loadMore,
  };
}; 