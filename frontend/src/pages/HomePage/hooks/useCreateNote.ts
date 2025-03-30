import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios.interceptor';

type Note = {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
}

export const useCreateNote = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = async (type: 'memo' | 'checklist') => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await api.post<Note>(
        '/notes',
        {
          name: 'Untitled Note',
          isMemo: type === 'memo'
        }
      );

      // Navigate to the new note
      navigate(`/notes/${response.data.id}`);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createNote, isCreating, error };
}; 