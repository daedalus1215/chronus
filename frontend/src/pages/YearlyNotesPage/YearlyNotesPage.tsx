import React from 'react';
import { YearlyNotesTimeline } from './components/YearlyNotesTimeline/YearlyNotesTimeline';
import { useNotesByYear } from './hooks/useNotesByYear';
import styles from './YearlyNotesPage.module.css';

export const YearlyNotesPage: React.FC = () => {
  const { data, isLoading, error } = useNotesByYear();

  return (
    <div className={styles.yearlyNotesPage}>
      <div className={styles.header}>
        <div className={styles.title}>Yearly Notes</div>
        <div className={styles.subtitle}>
          View notes you've worked on organized by year
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.timelinePaper}>
          <YearlyNotesTimeline
            data={data}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
