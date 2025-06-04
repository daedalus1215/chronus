import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNote } from "./hooks/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import { CheckListView } from "./components/CheckListView/CheckListView";
import { useTitle } from "./hooks/useTitle";
import { Error } from "../../components/Error/Error";
import styles from "./NotePage.module.css";

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const { title, setTitle, loading: titleLoading, error: titleError } = useTitle(note);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        Loading note...
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
      {Error(navigate, error || note === null ? "Error loading note" : "")}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
        disabled={titleLoading}
      />
      {titleError && <div className={styles.titleError}>{titleError}</div>}
      {note?.isMemo ? (
        <NoteEditor note={note} onSave={handleSave} />
      ) : (
        <CheckListView note={note} />
      )}
    </>
  );
};
