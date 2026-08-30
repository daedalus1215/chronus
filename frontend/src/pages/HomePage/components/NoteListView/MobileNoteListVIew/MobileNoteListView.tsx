import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../../hooks/useNotes';
import { NoteItem } from '../NoteItem/NoteItem';
import { SearchBar } from '../SearchBar/SearchBar';
import styles from './MobileNoteListView.module.css';
import { NOTE_TYPES } from '../../../../../constant';
import Fade from '@mui/material/Fade';
import { updateNoteTimestamp } from '../../../../../api/requests/notes.requests';
import { useCreateChecklistByName } from '../../../hooks/useCreateChecklistByName';
import { AddNoteSuggestion } from '../AddNoteSuggestion/AddNoteSuggestion';

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>Loading...</div>
);

const NoMoreNotes: React.FC = () => (
  <div className={styles.noMoreNotes}>No more notes to load</div>
);

type NoteListViewProps = {
  type?: keyof typeof NOTE_TYPES;
  tagId?: string;
};

export const MobileNoteListView: React.FC<NoteListViewProps> = ({
  type,
  tagId,
}) => {
  const navigate = useNavigate();
  const {
    notes,
    isLoading,
    error,
    hasMore,
    loadMore,
    hasPendingChanges,
    searchNotes,
    clearSearch,
    searchQuery,
    refreshNotes,
    moveNoteToTop,
  } = useNotes(type, tagId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const threshold = 100; // pixels from bottom to trigger load

    // Check if we're near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  // Add scroll event listener
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollHandler = () => {
      requestAnimationFrame(handleScroll);
    };

    scrollContainer.addEventListener('scroll', scrollHandler);
    return () => scrollContainer.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  const handleNoteClick = useCallback(
    async (noteId: number) => {
      navigate(`/notes/${noteId}`);
      try {
        await updateNoteTimestamp(noteId);
      } catch (error) {
        console.error('Failed to update note timestamp:', error);
      }
      setTimeout(() => moveNoteToTop(noteId), 350);
    },
    [moveNoteToTop, navigate]
  );

  const { createChecklistByName, isCreating, error: createError } =
    useCreateChecklistByName();

  const trimmedSearchQuery = searchQuery.trim();
  const showAddSuggestion =
    // The `type` prop is declared as NOTE_TYPES keys, but HomePage passes
    // NOTE_TYPES values ('memo' | 'checklist') at runtime.
    (type as string | undefined) === NOTE_TYPES.CHECKLIST &&
    trimmedSearchQuery.length > 0 &&
    notes.length === 0 &&
    !isLoading &&
    !error;

  const handleAddChecklist = async () => {
    const name = trimmedSearchQuery;
    if (!name || isCreating) return;
    const note = await createChecklistByName(name);
    if (note) {
      refreshNotes();
    }
  };

  if (isLoading && notes.length === 0) {
    return <div className={styles.noteListLoading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.noteListError}>{error}</div>;
  }

  return (
    <div className={styles.noteList}>
      <SearchBar
        value={searchQuery}
        onChange={searchNotes}
        onClear={clearSearch}
        type={type}
      />
      <div className={styles.noteListContent}>
        {hasPendingChanges && (
          <div className={styles.offlineNotice}>
            You have pending changes that will sync when you're back online.
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className={styles.noteListScrollContainer}
        >
          {showAddSuggestion && (
            <AddNoteSuggestion
              query={trimmedSearchQuery}
              onAdd={handleAddChecklist}
              isAdding={isCreating}
              error={createError}
            />
          )}
          {notes.map((note, index) => (
            <Fade
              key={note.id}
              in={true}
              timeout={300}
              style={{
                transitionDelay: `${Math.min(index * 50, 300)}ms`,
              }}
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
          {!hasMore && !showAddSuggestion && <NoMoreNotes />}
        </div>
      </div>
    </div>
  );
};
