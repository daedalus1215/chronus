import React from "react";
import { useParams } from "react-router-dom";
import { useNote } from "./hooks/useNote/useNote";
import { NoteEditor } from "./components/NoteEditor/NoteEditor";
import { CheckListView } from "./components/CheckListView/CheckListView";
import { useTitle } from "./hooks/useTitle";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import styles from "./NotePage.module.css";
import { useNoteTags } from './hooks/useNoteTags';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { useState } from 'react';
import { AddTagForm } from './components/AddTagForm/AddTagForm';
import { useAllTags } from './hooks/useAllTags';

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error, updateNote } = useNote(Number(id));
  const { title, setTitle, loading: titleLoading, error: titleError } = useTitle(note);
  const { tags, loading: tagsLoading, error: tagsError, refetch } = useNoteTags(Number(id));
  const { data: allTags, isLoading: allTagsLoading, error: allTagsError } = useAllTags();
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
        (tag: { id: string }) => !tags.some((noteTag: { id: string }) => noteTag.id === tag.id)
      )
    : [];

  return (
    <Box>
      {/* Tag List */}
      <Box className="flex items-center gap-2 overflow-x-auto py-2 mb-2">
        <button
          className="flex items-center px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Add tag"
          onClick={() => setAddTagOpen(true)}
          tabIndex={0}
        >
          <span className="mr-1 text-lg font-bold">+</span> Add Tag
        </button>
        {tagsLoading ? (
          <span className="text-gray-400 ml-2">Loading tags...</span>
        ) : tagsError ? (
          <span className="text-red-500 ml-2">Error loading tags</span>
        ) : (
          tags.map((tag: { id: string; name: string }) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium whitespace-nowrap"
              tabIndex={0}
              aria-label={`Tag: ${tag.name}`}
            >
              {tag.name}
            </span>
          ))
        )}
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
