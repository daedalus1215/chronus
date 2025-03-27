import { useState, useEffect } from 'react';
import axios from 'axios';

export type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
};

export const useNote = (noteId: number) => {
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

  const updateNote = async (updatedNote: Partial<Note>) => {
    if (!note) return;
    
    try {
      const response = await axios.patch<Note>(
        `http://localhost:3000/notes/${note.id}`,
        updatedNote
      );
      setNote(response.data);
      return response.data;
    } catch (err) {
      console.error('Error updating note:', err);
      throw new Error('Failed to update note');
    }
  };

  return { note, isLoading, error, updateNote };
}; 