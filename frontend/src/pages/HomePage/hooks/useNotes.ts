import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { noteDB, Note } from '../../../services/indexedDB/noteDB';
import api from '../../../api/axios.interceptor';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const isOnline = useOnlineStatus();

  // Fetch notes and handle offline state
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isOnline) {
        // If online, fetch from server and cache
        const response = await api.get<Note[]>('/notes/names');
        await noteDB.cacheNotes(response.data);
        setNotes(response.data);
      } else {
        // If offline, get from cache
        const userId = localStorage.getItem('userId'); // Assuming you store userId
        if (userId) {
          const cachedNotes = await noteDB.getCachedNotes(userId);
          setNotes(cachedNotes);
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync pending changes when coming back online
  const syncPendingChanges = async () => {
    try {
      const pendingChanges = await noteDB.getPendingChanges();
      
      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'create':
              await api.post('/notes', change.data);
              break;
            case 'update':
              await api.patch(`/notes/${change.data.id}`, change.data);
              break;
            case 'delete':
              await api.delete(`/notes/${change.data.id}`);
              break;
          }
          await noteDB.removePendingChange(change.id);
        } catch (err) {
          console.error('Failed to sync change:', err);
        }
      }

      // Refresh notes after sync
      await fetchNotes();
      setHasPendingChanges(false);
    } catch (err) {
      console.error('Error syncing changes:', err);
    }
  };

  // Check for pending changes
  useEffect(() => {
    const checkPendingChanges = async () => {
      const pendingChanges = await noteDB.getPendingChanges();
      setHasPendingChanges(pendingChanges.length > 0);

      if (isOnline && pendingChanges.length > 0) {
        await syncPendingChanges();
      }
    };

    checkPendingChanges();
  }, [isOnline]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    isLoading,
    error,
    hasPendingChanges,
    refreshNotes: fetchNotes,
    syncChanges: isOnline ? syncPendingChanges : undefined
  };
}; 