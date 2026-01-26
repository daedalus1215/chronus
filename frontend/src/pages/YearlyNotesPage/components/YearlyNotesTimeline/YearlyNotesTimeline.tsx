import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { NotesByYearResponseDto } from '../../../../api/dtos/time-tracks.dtos';
import { YearlyNoteItem } from '../YearlyNoteItem/YearlyNoteItem';
import styles from './YearlyNotesTimeline.module.css';

type YearlyNotesTimelineProps = {
  data: NotesByYearResponseDto | undefined;
  isLoading: boolean;
  error: Error | null;
};

export const YearlyNotesTimeline: React.FC<YearlyNotesTimelineProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="error">
          Failed to load yearly notes: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!data || data.years.length === 0) {
    return (
      <Box className={styles.emptyContainer}>
        <Typography className={styles.emptyTitle}>
          No notes found
        </Typography>
        <Typography className={styles.emptyMessage}>
          Start tracking time on your notes to see them here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.timelineContainer}>
      {data.years.map((yearData) => (
        <Box key={yearData.year} className={styles.yearSection}>
          <Box className={styles.yearHeader}>
            <Box className={styles.yearIndicator} />
            <Typography className={styles.yearTitle}>
              {yearData.year}
            </Typography>
            <Typography className={styles.noteCount}>
              {yearData.notes.length}{' '}
              {yearData.notes.length === 1 ? 'note' : 'notes'}
            </Typography>
          </Box>
          <Box className={styles.notesContainer}>
            {yearData.notes.map((note) => (
              <YearlyNoteItem key={note.noteId} note={note} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
