import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios.interceptor';
import { NOTE_TYPES } from '../../../constant';

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

  const createNote = async (type: keyof typeof NOTE_TYPES) => {
    try { 
      setIsCreating(true);
      setError(null);

      const response = await api.post<Note>(
        '/notes',
        {
          name: type === NOTE_TYPES.MEMO ? 'Memo' : 'Checklist',
          isMemo: type === NOTE_TYPES.MEMO
        }
      );

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