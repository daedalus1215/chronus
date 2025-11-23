import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNote } from "./hooks/useNote/useNote";
import { useTitle } from "./hooks/useTitle";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Tag, useNoteTags } from "./hooks/useNoteTags";
import { BottomSheet } from "../../components/BottomSheet/BottomSheet";
import { useState } from "react";
import { AddTagForm } from "./components/AddTagForm/AddTagForm";
import { useAllTags } from "./hooks/useAllTags";
import { Chip, IconButton } from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DesktopNoteEditor } from "./components/NoteEditor/DesktopNoteEditor/DesktopNoteEditor";
import { MobileNoteEditor } from "./components/NoteEditor/MobileNoteEditor/MobileNoteEditor";
import { DesktopCheckListView } from "./components/CheckListView/DesktopCheckListView/DesktopCheckListView";
import { MobileCheckListView } from "./components/CheckListView/MobileCheckListView/MobileCheckListView";
import styles from "./NotePage.module.css";

export const NotePage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    refetch,
    removeTagFromNote,
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

  const availableTags = allTags
    ? allTags.filter(
      (tag: { id: number }) =>
        !tags.some((noteTag: { id: number }) => noteTag.id === tag.id)
    )
    : [];

  return (
    <main className={styles.main}>
      <Box>
        <Box className="flex items-center gap-2 overflow-x-auto py-2 mb-2">
          <IconButton
            onClick={() => setAddTagOpen(true)}
            color="secondary"
            size="small"
          >
            <Add />
          </IconButton>

          {tags && tags.map((tag: Tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              variant="outlined"
              color="primary"
              size="small"
              className="whitespace-nowrap"
              onClick={() => navigate(`/tag-notes/${tag.id}`)}
              onDelete={async () => {
                try {
                  await removeTagFromNote({ tagId: tag.id, noteId: note.id });
                } catch (err) {
                  console.error("Failed to remove tag from note", err);
                }
              }}
              deleteIcon={<Close />}
            />
          ))}
        </Box>

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
        />
        {titleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {titleError}
          </Alert>
        )}
        {note?.isMemo ? (
          isMobile ? <MobileNoteEditor note={note} onSave={handleSave} />
            : <DesktopNoteEditor note={note} onSave={handleSave} />
        ) : isMobile ? <MobileCheckListView note={note} /> : (
          <DesktopCheckListView note={note} />
        )}
      </Box>
    </main>
  );
};