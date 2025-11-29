import { useState, useEffect } from 'react';
import { createTimeTrack } from '../../../../api/requests/time-tracks.requests';
import type { CreateTimeTrackRequest } from '../../../../api/dtos/note.dtos';
import { timeTrackDB } from '../../../../services/indexedDB/timeTrackDB';
import { useOnlineStatus } from '../../../../hooks/useOnlineStatus';

export const useCreateTimeTrack = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingTracks, setHasPendingTracks] = useState(false);
  const isOnline = useOnlineStatus();

  // Check for pending tracks on mount and when coming online
  useEffect(() => {
    const checkPendingTracks = async () => {
      const pendingTracks = await timeTrackDB.getPendingTimeTracks();
      setHasPendingTracks(pendingTracks.length > 0);

      // If we're online and have pending tracks, try to sync them
      if (isOnline && pendingTracks.length > 0) {
        syncPendingTracks();
      }
    };

    checkPendingTracks();
  }, [isOnline]);

  const syncPendingTracks = async () => {
    const pendingTracks = await timeTrackDB.getPendingTimeTracks();

    for (const track of pendingTracks) {
      try {
        await createTimeTrack(track.data);
        await timeTrackDB.removePendingTimeTrack(track.id);
      } catch (err) {
        console.error('Failed to sync time track:', err);
      }
    }

    setHasPendingTracks(false);
  };

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
    error,
    hasPendingTracks,
    syncPendingTracks: isOnline ? syncPendingTracks : undefined,
  };
};
