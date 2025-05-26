import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNote } from "./hooks/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import styles from "./NotePage.module.css";
import { CheckListView } from "./components/CheckListView/CheckListView";
import { useTitle } from "./hooks/useTitle";

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const { title, setTitle, loading: titleLoading, error: titleError } = useTitle(note);

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
        <p>{error || "Note not found"}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go back
        </button>
      </div>
    );
  }

  const handleSave = async (updatedNote: Partial<typeof note>) => {
    try {
      await updateNote(updatedNote);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  return (
    <>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
        disabled={titleLoading}
      />
      {titleError && (
        <div style={{ color: '#ef4444', marginTop: 4, fontSize: '0.95em' }}>{titleError}</div>
      )}
      {note.isMemo ? (
        <NoteEditor note={note} onSave={handleSave} />
      ) : (
        <CheckListView note={note} />
      )}
    </>
  );
};
