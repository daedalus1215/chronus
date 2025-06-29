import React from "react";
import { useParams } from "react-router-dom";
import { useNote } from "./hooks/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import { CheckListView } from "./components/CheckListView/CheckListView";
import { useTitle } from "./hooks/useTitle";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import styles from "./NotePage.module.css";

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const { title, setTitle, loading: titleLoading, error: titleError } = useTitle(note);

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress color="primary" />
        Loading note...
      </Box>
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
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>Error loading note</Alert>}
      <TextField
        value={title}
        onChange={e => setTitle(e.target.value)}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
        disabled={titleLoading}
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          style: { fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-text)' }
        }}
        sx={{ mb: 1 }}
      />
      {titleError && <Alert severity="error" sx={{ mb: 2 }}>{titleError}</Alert>}
      {note?.isMemo ? (
        <NoteEditor note={note} onSave={handleSave} />
      ) : (
        <CheckListView note={note} />
      )}
    </Box>
  );
};
