import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NOTE_TYPES } from '../../../constant';
import { createNote as createNoteRequest } from '../../../api/requests/notes.requests';

export const useCreateNote = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = async (type: keyof typeof NOTE_TYPES) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createNoteRequest(type);

      navigate(`/notes/${response.id}`);
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
