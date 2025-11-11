import React, { useCallback, useRef } from "react";
import { useNotes } from "../../../hooks/useNotes";
import { NoteItem } from "../NoteItem/NoteItem";
import { SearchBar } from "../SearchBar/SearchBar";
import styles from "./DesktopNoteListView.module.css";
import { useResizablePane } from "../../../../../hooks/useResizablePane";

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>Loading...</div>
);

const NoMoreNotes: React.FC = () => (
  <div className={styles.noMoreNotes}>No more notes to load</div>
);

type NoteListViewProps = {
  type?: 'MEMO' | 'CHECKLIST';
  tagId?: string;
  onNoteSelect?: (noteId: number) => void;
  selectedNoteId?: number | null;
};

export const DesktopNoteListView: React.FC<NoteListViewProps> = ({ 
  type, 
  tagId,
  onNoteSelect,
  selectedNoteId 
}) => {
  const { 
    notes, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    hasPendingChanges,
    searchNotes,
    clearSearch,
    searchQuery
  } = useNotes(type, tagId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { size: width, startResizing, handleKeyDown, handleDoubleClick } = useResizablePane({
    localStorageKey: 'noteListWidthPx',
    min: 10, // allow thin rail
    max: 300, // do not expand beyond default width
    initial: 300,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [10, 48, 72, 96, 120, 160, 220, 300],
    snapThreshold: 10
  });

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
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

  const handleNoteClick = (noteId: number) => {
    onNoteSelect?.(noteId);
  };

  if (isLoading && notes.length === 0) {
    return <div className={styles.noteListLoading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.noteListError}>{error}</div>;
  }

  return (
    <div ref={listContainerRef} className={styles.noteList} style={{ position: 'relative', width: `${width}px`, flex: '0 0 auto' }}>
      {width >= 120 && (
        <SearchBar 
          value={searchQuery}
          onChange={searchNotes}
          onClear={clearSearch}
          type={type}
        />
      )}
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
          {notes.map((note) => (
            <NoteItem 
              key={note.id} 
              note={note}
              onClick={() => handleNoteClick(note.id)}
              isSelected={selectedNoteId === note.id}
            />
          ))}
          {isLoading && <LoadingSpinner />}
          {!hasMore && <NoMoreNotes />}
        </div>
      </div>
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize note list"
        tabIndex={0}
        className={styles.resizeHandle}
        onMouseDown={startResizing}
        onPointerDown={startResizing}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};