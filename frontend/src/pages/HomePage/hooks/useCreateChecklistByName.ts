import { useCallback, useState } from 'react';
import {
  createChecklistByName as createChecklistByNameRequest,
} from '../../../api/requests/notes.requests';

export const useCreateChecklistByName = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChecklistByName = useCallback(async (name: string) => {
    try {
      setIsCreating(true);
      setError(null);

      const note = await createChecklistByNameRequest(name);
      return note;
    } catch (err) {
      console.error('Error creating checklist:', err);
      setError('Failed to create checklist');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createChecklistByName, isCreating, error };
};
