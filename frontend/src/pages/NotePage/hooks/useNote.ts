import { useState, useEffect } from 'react';
import api from '../../../api/axios.interceptor';
import { Note } from '../api/responses';

export const useNote = (noteId: number) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<Note>(`/notes/detail/${noteId}`);
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
      const { name, description, tags } = updatedNote;
      const response = await api.patch<Note>(
        `/notes/detail/${note.id}`,
        { name, description, tags }
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