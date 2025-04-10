import { useState } from 'react';
import { createTimeTrack } from './createTimeTrack/createTimeTrack';
import type { CreateTimeTrackRequest } from './createTimeTrack/types/createTimeTrackRequest';

export const useCreateTimeTrack = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTimeTrack = async (data: CreateTimeTrackRequest) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createTimeTrack(data);
      return response;
    } catch (err) {
      console.error('Error creating time track:', err);
      setError('Failed to create time track');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTimeTrack: handleCreateTimeTrack,
    isCreating,
    error
  };
};
