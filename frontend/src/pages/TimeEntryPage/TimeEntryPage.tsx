import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeEntryDataGrid } from './components/TimeEntryDataGrid/TimeEntryDataGrid';
import {
  QuickAddRow,
  QuickAddFormData,
} from './components/QuickAddRow/QuickAddRow';
import { DateRangePicker } from '../../components/DateRangePicker/DateRangePicker';
import { SummaryStats } from './components/SummaryStats/SummaryStats';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  useTimeTrackDateRange,
  DateRange,
} from '../../hooks/useTimeTrackDateRange';
import {
  getTimeTracksByDateRange,
  createTimeTrack,
} from '../../api/requests/time-tracks.requests';
import { TimeTrackWithNoteResponse } from '../../api/dtos/time-tracks.dtos';
import styles from './TimeEntryPage.module.css';

export const TimeEntryPage: React.FC = () => {
  const isMobile = useIsMobile();

  const { from, to, setPreset, setFrom, setTo } = useTimeTrackDateRange(5);
  const [tracks, setTracks] = useState<TimeTrackWithNoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toastPosition = isMobile ? 'top-center' : 'bottom-center';

  const fetchTracks = useCallback(async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTimeTracksByDateRange(dateRange.from, dateRange.to);
      setTracks(data);
    } catch (err) {
      setError('Failed to load time tracks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks({ from, to });
  }, [from, to, fetchTracks]);

  const handleAdd = useCallback(
    async (data: QuickAddFormData) => {
      try {
        await createTimeTrack({
          noteId: data.noteId,
          date: data.date,
          startTime: data.startTime,
          durationMinutes: data.durationMinutes,
        });
        await fetchTracks({ from, to });
        toast.success('Time track added successfully', { position: toastPosition });
      } catch (err) {
        console.error(err);
        toast.error('Failed to add time track', { position: toastPosition });
      }
    },
    [from, to, fetchTracks, toastPosition]
  );

  const handleDelete = useCallback(
    (id: number) => {
      setTracks(prev => prev.filter(t => t.id !== id));
      toast.success('Time track deleted', { position: toastPosition });
    },
    [toastPosition]
  );

  const handleUpdate = useCallback(
    (id: number, updated: TimeTrackWithNoteResponse) => {
      setTracks(prev => prev.map(t => (t.id === id ? updated : t)));
      toast.success('Time track updated', { position: toastPosition });
    },
    [toastPosition]
  );

  const stats = useMemo(() => {
    const totalMinutes = tracks.reduce(
      (sum, track) => sum + track.durationMinutes,
      0
    );
    return {
      totalMinutes,
      entryCount: tracks.length,
    };
  }, [tracks]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quick Log</h1>
        <span className={styles.subtitle}>
          Track your time across notes and activities
        </span>
      </div>

      <SummaryStats
        totalMinutes={stats.totalMinutes}
        entryCount={stats.entryCount}
      />

      <DateRangePicker
        from={from}
        to={to}
        onPreset={setPreset}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      <QuickAddRow onSubmit={handleAdd} />

      {error && (
        <Alert variant="destructive" className={styles.errorAlert}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={styles.gridWrapper}>
        <TimeEntryDataGrid
          rows={tracks}
          loading={loading}
          onRowDeleted={handleDelete}
          onRowUpdated={handleUpdate}
        />
      </div>
    </div>
  );
};
