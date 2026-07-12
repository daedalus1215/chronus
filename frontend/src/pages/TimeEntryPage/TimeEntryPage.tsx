import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  SnackbarContent,
} from '@mui/material';
import { TimeEntryDataGrid } from './components/TimeEntryDataGrid/TimeEntryDataGrid';
import { QuickAddRow, QuickAddFormData } from './components/QuickAddRow/QuickAddRow';
import { DateRangePicker } from './components/DateRangePicker/DateRangePicker';
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
        // The backend returns TimeTrackResponseDto which lacks noteName.
        // Do a fresh fetch to get the full response.
        await fetchTracks({ from, to });
        setSnackbar({
          open: true,
          message: 'Time track added',
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
      // Optimistic delete
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

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Quick Log
        </Typography>
      </Box>

      <DateRangePicker
        from={from}
        to={to}
        onPreset={setPreset}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      <QuickAddRow onSubmit={handleAdd} />

      {error && (
        <Alert severity="error">{error}</Alert>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SnackbarContent
          message={snackbar.message}
          sx={{
            backgroundColor:
              snackbar.severity === 'error' ? 'error.main' : 'success.main',
          }}
        />
      </Snackbar>
    </Box>
  );
};
