import React from 'react';
import { useParams } from 'react-router-dom';
import { useNote } from './hooks/useNote';
import styles from './NotePage.module.css';

export const NotePage:React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error } = useNote(id || '');

  if (isLoading) {
    return (
      <div className={styles.notePage}>
        <div className={styles.noteLoading}>Loading note...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notePage}>
        <div className={styles.noteError}>{error}</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className={styles.notePage}>
        <div className={styles.noteError}>Note not found</div>
      </div>
    );
  }

  return (
    <div className={styles.notePage}>
      <div className={styles.noteHeader}>
        <h1 className={styles.noteTitle}>{note.name}</h1>
        <div className={styles.noteMetadata}>
          <span className={styles.noteDate}>
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
          {note.tags.length > 0 && (
            <div className={styles.tagList}>
              {note.tags.map((tag) => (
                <span key={tag.id} className={styles.tag}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 