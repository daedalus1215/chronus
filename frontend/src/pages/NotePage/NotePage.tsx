import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useNote } from "./hooks/useNote/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import { CheckListView } from "./components/CheckListView/CheckListView";
import { useTitle } from "./hooks/useTitle";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import styles from "./NotePage.module.css";
import { useNoteTags } from "./hooks/useNoteTags";
import { BottomSheet } from "../../components/BottomSheet/BottomSheet";
import { useState } from "react";
import { AddTagForm } from "./components/AddTagForm/AddTagForm";
import { useAllTags } from "./hooks/useAllTags";
import { Button, Chip, IconButton } from "@mui/material";
import { Add, Close } from "@mui/icons-material";

export const NotePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const {
    title,
    setTitle,
    loading: titleLoading,
    error: titleError,
  } = useTitle(note);
  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
    refetch,
  } = useNoteTags(Number(id));
  const {
    data: allTags,
    isLoading: allTagsLoading,
    error: allTagsError,
  } = useAllTags();
  const [isAddTagOpen, setAddTagOpen] = useState(false);

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

  // Compute tags that are not already on the note
  const availableTags = allTags
    ? allTags.filter(
        (tag: { id: string }) =>
          !tags.some((noteTag: { id: string }) => noteTag.id === tag.id)
      )
    : [];

  return (
    <Box>
      {/* Tag List */}
      <Box className="flex items-center gap-2 overflow-x-auto py-2 mb-2">
        <IconButton
          onClick={() => setAddTagOpen(true)}
          color="secondary"
          size="small"
        >
          <Add />
        </IconButton>

        {tags && tags.map((tag: { id: string; name: string }) => (
            <Chip
              key={tag.id}
              label={tag.name}
              variant="outlined"
              color="primary"
              size="small"
              className="whitespace-nowrap"
              onClick={() => navigate(`/tag-notes/${tag.id}`)}
              onDelete={() => {
                console.log("delete");
              }}
              deleteIcon={<Close />}
            />
          ))}
      </Box>
      {/* Add Tag BottomSheet */}
      <BottomSheet isOpen={isAddTagOpen} onClose={() => setAddTagOpen(false)}>
        {allTagsLoading ? (
          <span className="text-gray-400 ml-2">Loading all tags...</span>
        ) : allTagsError ? (
          <span className="text-red-500 ml-2">Error loading all tags</span>
        ) : (
          <AddTagForm
            noteId={Number(id)}
            tags={availableTags}
            onTagAdded={refetch}
            onClose={() => setAddTagOpen(false)}
          />
        )}
      </BottomSheet>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading note
        </Alert>
      )}
      <TextField
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
        disabled={titleLoading}
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          style: {
            fontWeight: 600,
            fontSize: "1.2rem",
            color: "var(--color-text)",
          },
        }}
        sx={{ mb: 1 }}
      />
      {titleError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {titleError}
        </Alert>
      )}
      {note?.isMemo ? (
        <NoteEditor note={note} onSave={handleSave} />
      ) : (
        <CheckListView note={note} />
      )}
    </Box>
  );
};
