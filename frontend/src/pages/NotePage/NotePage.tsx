import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNote } from "./hooks/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import styles from "./NotePage.module.css";
import { CheckListView } from "./components/CheckListView/CheckListView";

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
        <p>{error || "Note not found"}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
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
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleSave({ name: e.target.value });
    } catch (err) {
      console.error("Failed to update title:", err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <input
        type="text"
        value={note.name}
        onChange={handleTitleChange}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
      />
      {note.isMemo ? (
        <NoteEditor note={note} onSave={handleSave} />
      ) : (
        <CheckListView note={note} />
      )}
    </div>
  );
};
