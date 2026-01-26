import React from 'react';
import { Box, Typography } from '@mui/material';
import { YearlyNotesTimeline } from './components/YearlyNotesTimeline/YearlyNotesTimeline';
import { useNotesByYear } from './hooks/useNotesByYear';
import styles from './YearlyNotesPage.module.css';

export const YearlyNotesPage: React.FC = () => {
  const { data, isLoading, error } = useNotesByYear();

  return (
    <div className={styles.yearlyNotesPage}>
      <Box className={styles.header}>
        <Typography className={styles.title}>
          Yearly Notes
        </Typography>
        <Typography className={styles.subtitle}>
          View notes you've worked on organized by year
        </Typography>
      </Box>
      <Box className={styles.content}>
        <div className={styles.timelinePaper}>
          <YearlyNotesTimeline
            data={data}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </Box>
    </div>
  );
};
