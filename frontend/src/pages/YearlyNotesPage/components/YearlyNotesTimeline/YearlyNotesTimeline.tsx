import React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      <div className={styles.loadingContainer}>
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load yearly notes: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || data.years.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyTitle}>No notes found</span>
        <span className={styles.emptyMessage}>
          Start tracking time on your notes to see them here.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      {data.years.map(yearData => (
        <div key={yearData.year} className={styles.yearSection}>
          <div className={styles.yearHeader}>
            <div className={styles.yearIndicator} />
            <span className={styles.yearTitle}>{yearData.year}</span>
            <span className={styles.noteCount}>
              {yearData.notes.length}{' '}
              {yearData.notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          <div className={styles.notesContainer}>
            {yearData.notes.map(note => (
              <YearlyNoteItem key={note.noteId} note={note} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
