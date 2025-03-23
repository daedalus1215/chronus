import React from 'react';
import { useNotes } from '../../../../hooks/useNotes';
import { NoteItem } from './NoteItem';
import styles from './NoteListView.module.css';

interface NoteListViewProps {
  userId: string;
}

export function NoteListView({ userId }: NoteListViewProps) {
  const { notes, isLoading, error } = useNotes(userId);

  if (isLoading) {
    return <div className={styles.noteListLoading}>Loading notes...</div>;
  }

  if (error) {
    return <div className={styles.noteListError}>{error}</div>;
  }

  if (notes.length === 0) {
    return <div className={styles.noteListEmpty}>No notes found</div>;
  }

  return (
    <div className={styles.noteList}>
      <div className={styles.noteListHeader}>
        <h2 className={styles.noteListTitle}>Recent</h2>
        <button className={styles.sortButton}>
          Default ↓
        </button>
      </div>
      <div className={styles.noteListContent}>
        {notes.map((note, index) => (
          <NoteItem key={index} note={note} />
        ))}
      </div>
    </div>
  );
}
