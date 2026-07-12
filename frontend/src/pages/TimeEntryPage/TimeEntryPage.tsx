import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  SnackbarContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TimeEntryDataGrid } from './components/TimeEntryDataGrid/TimeEntryDataGrid';
import { QuickAddRow, QuickAddFormData } from './components/QuickAddRow/QuickAddRow';
import { DateRangePicker } from './components/DateRangePicker/DateRangePicker';
import { SummaryStats } from './components/SummaryStats/SummaryStats';
import {
  useTimeTrackDateRange,
  DateRange,
} from './hooks/useTimeTrackDateRange';
import {
  getTimeTracksByDateRange,
  createTimeTrack,
} from '../../api/requests/time-tracks.requests';
import { TimeTrackWithNoteResponse } from '../../api/dtos/time-tracks.dtos';
import styles from './TimeEntryPage.module.css';

export const TimeEntryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { from, to, setPreset, setFrom, setTo } = useTimeTrackDateRange(5);
  const [tracks, setTracks] = useState<TimeTrackWithNoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchTracks = useCallback(
    async (dateRange: DateRange) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTimeTracksByDateRange(
          dateRange.from,
          dateRange.to
        );
        setTracks(data);
      } catch (err) {
        setError('Failed to load time tracks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
        setSnackbar({
          open: true,
          message: 'Time track added successfully',
          severity: 'success',
        });
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: 'Failed to add time track',
          severity: 'error',
        });
      }
    },
    [from, to, fetchTracks]
  );

  const handleDelete = useCallback(
    (id: number) => {
      setTracks((prev) => prev.filter((t) => t.id !== id));
      setSnackbar({
        open: true,
        message: 'Time track deleted',
        severity: 'success',
      });
    },
    []
  );

  const handleUpdate = useCallback(
    (id: number, updated: TimeTrackWithNoteResponse) => {
      setTracks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSnackbar({
        open: true,
        message: 'Time track updated',
        severity: 'success',
      });
    },
    []
  );

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

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
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Quick Log
        </Typography>
        <Typography variant="body2" className={styles.subtitle}>
          Track your time across notes and activities
        </Typography>
      </Box>

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
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Box className={styles.gridWrapper}>
        <TimeEntryDataGrid
          rows={tracks}
          loading={loading}
          onRowDeleted={handleDelete}
          onRowUpdated={handleUpdate}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: isMobile ? 'top' : 'bottom',
          horizontal: 'center',
        }}
      >
        <SnackbarContent
          message={snackbar.message}
          className={
            snackbar.severity === 'error'
              ? styles.snackbarError
              : styles.snackbarSuccess
          }
        />
      </Snackbar>
    </Box>
  );
};
