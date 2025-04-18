import { useState, useEffect } from 'react';
import api from '../../../../api/axios.interceptor';

type TimeTrack = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

export const useNoteTimeTracks = (noteId: number, isOpen: boolean) => {
  const [timeTracks, setTimeTracks] = useState<TimeTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTimeTracks = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<TimeTrack[]>(`/time-tracks/note/${noteId}`);
        if (isMounted) {
          setTimeTracks(response.data);
        }
      } catch (err) {
        console.error('Error fetching time tracks:', err);
        if (isMounted) {
          setError('Failed to load time entries');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTimeTracks();

    return () => {
      isMounted = false;
    };
  }, [noteId, isOpen]);

  return {
    timeTracks,
    isLoading,
    error
  };
}; 