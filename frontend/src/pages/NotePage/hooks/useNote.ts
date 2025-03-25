import { useState, useEffect } from 'react';
import axios from 'axios';

export type Note = {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
};

export const useNote = (noteId: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<Note>(`http://localhost:3000/notes/detail/${noteId}`);
        setNote(response.data);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to fetch note');
      } finally {
        setIsLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  return { note, isLoading, error };
}; 