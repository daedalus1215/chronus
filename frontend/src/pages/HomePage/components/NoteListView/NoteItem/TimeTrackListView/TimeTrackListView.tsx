import React, { useEffect, useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { getTimeTracksTotalByNoteId } from '../../../../../../api/time-tracks';
import styles from './TimeTrackListView.module.css';

type TimeTrack = {
  id: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};

type TimeTrackListProps = {
  isOpen: boolean;
  onClose: () => void;
  timeTracks: TimeTrack[];
  isLoading: boolean;
  error?: string;
  noteId: number;
};

export const TimeTrackListView: React.FC<TimeTrackListProps> = ({
  isOpen,
  onClose,
  timeTracks,
  isLoading,
  error,
  noteId
}) => {
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);
  const [totalError, setTotalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalTime = async () => {
      if (!isOpen) return;
      
      setIsLoadingTotal(true);
      setTotalError(null);
      try {
        const total = await getTimeTracksTotalByNoteId(noteId);
        setTotalTime(total);
      } catch (err) {
        setTotalError('Failed to load total time');
      } finally {
        setIsLoadingTotal(false);
      }
    };

    fetchTotalTime();
  }, [isOpen, noteId]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Time Entries</h3>
          <div className={styles.loading}>Loading time entries...</div>
        </div>
      </BottomSheet>
    );
  }

  if (error) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Time Entries</h3>
          <div className={styles.error}>{error}</div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Time Entries</h3>
        <div className={styles.totalTimeContainer}>
          {isLoadingTotal ? (
            <div className={styles.loading}>Loading total time...</div>
          ) : totalError ? (
            <div className={styles.error}>{totalError}</div>
          ) : totalTime !== null ? (
            <div className={styles.totalTime}>
              Total Time: {formatDuration(totalTime)}
            </div>
          ) : null}
        </div>
        {timeTracks.length === 0 ? (
          <div className={styles.empty}>No time entries found</div>
        ) : (
          <div className={styles.list}>
            {timeTracks.map((track) => (
              <div key={track.id} className={styles.timeTrackItem}>
                <div className={styles.timeTrackHeader}>
                  <div className={styles.timeTrackDate}>
                    {formatDate(track.date)}
                  </div>
                  <div className={styles.timeTrackDuration}>
                    {formatDuration(track.durationMinutes)}
                  </div>
                </div>
                <div className={styles.timeTrackTime}>
                  Started at {track.startTime}
                </div>
                {track.note && (
                  <div className={styles.timeTrackNote}>{track.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}; 