import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { NotesByYearResponseDto } from '../../../../api/dtos/time-tracks.dtos';
import { ROUTES } from '../../../../constants/routes';
import { formatDateForDisplay } from '../../../../utils/dateUtils';
import styles from './YearlyNoteItem.module.css';

type YearlyNote = NotesByYearResponseDto['years'][0]['notes'][0];

type YearlyNoteItemProps = {
  note: YearlyNote;
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

export const YearlyNoteItem: React.FC<YearlyNoteItemProps> = ({ note }) => {
  const navigate = useNavigate();

  const handleNoteClick = () => {
    navigate(`${ROUTES.HOME}${ROUTES.NOTE(note.noteId)}`);
  };

  const handleTagClick = (e: React.MouseEvent, tagId: number) => {
    e.stopPropagation();
    navigate(ROUTES.TAG_NOTES(tagId));
  };

  const firstDateFormatted = formatDateForDisplay(note.firstDate, {
    month: 'short',
    day: 'numeric',
  });
  const lastDateFormatted = formatDateForDisplay(note.lastDate, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={styles.noteItem} onClick={handleNoteClick}>
      <div className={styles.noteContent}>
        <span className={styles.noteName}>{note.noteName}</span>
        <div className={styles.noteDetails}>
          <div className={styles.topRow}>
            <span className={styles.dateRange}>
              {firstDateFormatted} - {lastDateFormatted}
            </span>
            <div className={styles.metrics}>
              <span className={styles.time}>
                {formatTime(note.totalTimeMinutes)}
              </span>
              <span className={styles.dateCount}>
                {note.dateCount} {note.dateCount === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {note.tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={styles.tagChip}
                  onClick={e => handleTagClick(e, tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
