import { useState, useEffect } from 'react';
import api from '../../../api/axios.interceptor';

type Note = {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

export const useNotes = (userId: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<Note[]>(`/notes/names`);
        setNotes(response.data);
      } catch (err) {
        setError('Failed to fetch notes');
        console.error('Error fetching notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  return { notes, isLoading, error };
}; 