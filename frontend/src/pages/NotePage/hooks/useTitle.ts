import React from 'react';
import api from '../../../api/axios.interceptor';

export type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type UseTitleReturn = {
  title: string;
  setTitle: (newTitle: string) => void;
  loading: boolean;
  error: string | null;
};

export const useTitle = (note: Note | null): UseTitleReturn => {
  const [title, setTitleState] = React.useState(note?.name || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<number>();
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    setTitleState(note?.name || '');
  }, [note?.name]);

  const setTitle = React.useCallback((newTitle: string) => {
    setTitleState(newTitle);
    setError(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(async () => {
      if (!note) return;
      setLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        const res = await api.patch(`/api/notes/title/${note.id}`, {
          name: newTitle
        }, {
          signal: abortRef.current.signal,
        });
        if (res.status !== 200) {
          const data = res.data;
          throw new Error(data.message || 'Failed to update title');
        }
      } catch (err: unknown) {
        let message = 'Failed to update title';
        if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
          message = (err as { message: string }).message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    }, 1200);
  }, [note]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  return { title, setTitle, loading, error };
}; 