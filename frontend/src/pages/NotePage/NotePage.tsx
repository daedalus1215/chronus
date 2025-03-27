import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNote } from './hooks/useNote';
import { NoteEditor } from './components/NoteEditor/NoteEditor';
import styles from './NotePage.module.css';

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const [isSaving, setIsSaving] = React.useState(false);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        Loading note...
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading note</h2>
        <p>{error || 'Note not found'}</p>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          Go back
        </button>
      </div>
    );
  }

  const handleSave = async (updatedNote: Partial<typeof note>) => {
    setIsSaving(true);
    try {
      await updateNote(updatedNote);
    } catch (err) {
      console.error('Failed to save note:', err);
      // You might want to show an error toast here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <button 
        onClick={() => navigate(-1)}
        className={styles.backButton}
      >
        ← Back
      </button>
      <NoteEditor 
        note={note}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
}; 