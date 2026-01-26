import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Chip } from '@mui/material';
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
      <Box className={styles.noteContent}>
        <Typography className={styles.noteName}>
          {note.noteName}
        </Typography>
        <Box className={styles.noteDetails}>
          <Box className={styles.topRow}>
            <Typography className={styles.dateRange}>
              {firstDateFormatted} - {lastDateFormatted}
            </Typography>
            <Box className={styles.metrics}>
              <Typography className={styles.time}>
                {formatTime(note.totalTimeMinutes)}
              </Typography>
              <Typography className={styles.dateCount}>
                {note.dateCount} {note.dateCount === 1 ? 'day' : 'days'}
              </Typography>
            </Box>
          </Box>
          {note.tags && note.tags.length > 0 && (
            <Box className={styles.tagsContainer}>
              {note.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                  className={styles.tagChip}
                  onClick={(e) => handleTagClick(e, tag.id)}
                  sx={{
                    height: '20px',
                    fontSize: '0.6875rem',
                    borderColor: 'var(--color-primary, #6366f1)',
                    color: 'var(--color-text-secondary, #9ca3af)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary-light, rgba(99, 102, 241, 0.1))',
                      borderColor: 'var(--color-primary, #6366f1)',
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
};
