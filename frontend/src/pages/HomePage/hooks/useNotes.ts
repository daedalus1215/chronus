import { useState, useEffect } from 'react';
import axios from 'axios';

interface Note {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
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
        const response = await axios.get<Note[]>(`http://localhost:3000/notes/${userId}/names`);
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