import { useState, useEffect } from 'react';
import api from '../../../api/axios.interceptor';
import { Note } from '../api/responses';
import { fetchNoteById } from '../api/requests';

export const useNote = (noteId: number) => {
  const [note, setNote] = useState<Note>({
    id: 0,
    name: "",
    userId: "",
    isMemo: false,
    createdAt: "",
    updatedAt: "",
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchNoteById(noteId);
        await api.patch(`/notes/${noteId}/timestamp`);
        setNote(data);
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