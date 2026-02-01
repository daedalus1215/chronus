import React, { useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTagById } from '../../../../../api/requests/tags.requests';
import { updateNoteTimestamp } from '../../../../../api/requests/notes.requests';
import { useNotesForTag } from '../../../hooks/useNotesForTag';
import { NoteItem } from '../../../../HomePage/components/NoteListView/NoteItem/NoteItem';
import { ROUTES } from '../../../../../constants/routes';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import styles from './MobileTagNotesListView.module.css';

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>Loading...</div>
);

const NoMoreNotes: React.FC = () => (
  <div className={styles.noMoreNotes}>No more notes to load</div>
);

export const MobileTagNotesListView: React.FC = () => {
  const navigate = useNavigate();
  const { tagId } = useParams<{ tagId: string }>();
  const {
    notes,
    isLoading,
    error,
    hasMore,
    loadMore,
    moveNoteToTop,
  } = useNotesForTag(tagId);

  const { data: tag, isLoading: tagLoading } = useQuery({
    queryKey: ['tag', tagId],
    queryFn: () => fetchTagById(Number(tagId)),
    enabled: !!tagId,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const threshold = 100;
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const scrollHandler = () => requestAnimationFrame(handleScroll);
    scrollContainer.addEventListener('scroll', scrollHandler);
    return () => scrollContainer.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  const handleNoteClick = useCallback(
    async (noteId: number) => {
      moveNoteToTop(noteId);
      try {
        await updateNoteTimestamp(noteId);
      } catch (err) {
        console.error('Failed to update note timestamp:', err);
      }
      if (tagId != null) {
        navigate(`${ROUTES.TAG_NOTES(tagId)}/notes/${noteId}`, { replace: false });
      }
    },
    [moveNoteToTop, navigate, tagId]
  );

  const handleBack = useCallback(() => {
    navigate(ROUTES.TAGS);
  }, [navigate]);

  if (tagId == null) {
    return null;
  }

  if (isLoading && notes.length === 0) {
    return <div className={styles.notesListLoading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.notesListError}>{error}</div>;
  }

  return (
    <div className={styles.notesList}>
      <header className={styles.header}>
        <IconButton
          className={styles.backButton}
          onClick={handleBack}
          onKeyDown={(e) => e.key === 'Enter' && handleBack()}
          aria-label="Back to tags"
          size="small"
        >
          <ArrowBack />
        </IconButton>
        <Typography
          component="span"
          className={styles.title}
          variant="body1"
          aria-live="polite"
        >
          {tagLoading ? '…' : tag?.name ?? `Tag ${tagId}`}
        </Typography>
      </header>
      <div className={styles.notesListContent}>
        <div
          ref={scrollContainerRef}
          className={styles.notesListScrollContainer}
        >
          {notes.map((note, index) => (
            <Fade
              key={note.id}
              in
              timeout={300}
              style={{ transitionDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <div>
                <NoteItem
                  note={note}
                  onClick={() => handleNoteClick(note.id)}
                />
              </div>
            </Fade>
          ))}
          {isLoading && <LoadingSpinner />}
          {!hasMore && notes.length > 0 && <NoMoreNotes />}
        </div>
      </div>
    </div>
  );
};
