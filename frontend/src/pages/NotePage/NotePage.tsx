import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNote } from './hooks/useNote/useNote';
import { useTitle } from './hooks/useTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Tag, useNoteTags } from './hooks/useNoteTags';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { useState } from 'react';
import { AddTagForm } from './components/AddTagForm/AddTagForm';
import { useAllTags } from './hooks/useAllTags';
import { Chip, IconButton, Button } from '@mui/material';
import { Add, Close, Edit, Cancel, ViewKanban } from '@mui/icons-material';
import { useIsMobile } from '../../hooks/useIsMobile';
import { DesktopNoteEditor } from './components/NoteEditor/DesktopNoteEditor/DesktopNoteEditor';
import { MobileNoteEditor } from './components/NoteEditor/MobileNoteEditor/MobileNoteEditor';
import { DesktopNoteReadView } from './components/NoteReadView/DesktopNoteReadView/DesktopNoteReadView';
import { MobileNoteReadView } from './components/NoteReadView/MobileNoteReadView/MobileNoteReadView';
import { DesktopCheckListView } from './components/CheckListView/DesktopCheckListView/DesktopCheckListView';
import { MobileCheckListView } from './components/CheckListView/MobileCheckListView/MobileCheckListView';
import { TranscriptionRecorder } from './components/TranscriptionRecorder/TranscriptionRecorder';
import { useTranscriptionCallback } from './hooks/useTranscriptionCallback/useTranscriptionCallback';
import styles from './NotePage.module.css';

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
  const { tags, refetch, removeTagFromNote } = useNoteTags(Number(id));

  const {
    data: allTags,
    isLoading: allTagsLoading,
    error: allTagsError,
  } = useAllTags();
  const [isAddTagOpen, setAddTagOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Use custom hook to manage transcription callback chain
  const { setAppendToDescriptionFn, onTranscription: onTranscriptionCallback } =
    useTranscriptionCallback();

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
      console.error('Failed to save note:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const availableTags = allTags
    ? allTags.filter(
        (tag: { id: number }) =>
          !tags.some((noteTag: { id: number }) => noteTag.id === tag.id)
      )
    : [];

  const addTagOptions = availableTags.map(tag => ({
    id: String(tag.id),
    name: tag.name,
  }));

  return (
    <main className={styles.main}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box className="flex items-center gap-2 overflow-x-auto py-2 mb-2">
          <IconButton
            onClick={() => setAddTagOpen(true)}
            color="secondary"
            size="small"
          >
            <Add />
          </IconButton>

          {tags &&
            tags.map((tag: Tag) => (
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
                    console.error('Failed to remove tag from note', err);
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
              tags={addTagOptions}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: note?.isMemo && !isEditMode ? 0 : 1,
          }}
        >
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
              style: {
                fontWeight: 600,
                marginLeft: '20px',
                fontSize: '1.2rem',
                color: 'var(--color-text)',
              },
            }}
          />
          {note?.isMemo && (
            <>
              {!isEditMode ? (
                <IconButton
                  onClick={handleEditClick}
                  color="primary"
                  size="small"
                  aria-label="Edit note"
                >
                  <Edit />
                </IconButton>
              ) : (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </>
          )}
          <IconButton
            onClick={() => navigate(`/notes/${note.id}/kanban`)}
            color="primary"
            size="small"
            aria-label="Open kanban board"
          >
            <ViewKanban />
          </IconButton>
        </Box>
        {titleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {titleError}
          </Alert>
        )}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {note?.isMemo ? (
            <>
              {isEditMode && (
                <TranscriptionRecorder
                  noteId={note.id}
                  onTranscription={onTranscriptionCallback}
                />
              )}
              {isEditMode ? (
                isMobile ? (
                  <MobileNoteEditor
                    note={note}
                    onSave={handleSave}
                    onAppendToDescription={setAppendToDescriptionFn}
                  />
                ) : (
                  <DesktopNoteEditor
                    note={note}
                    onSave={handleSave}
                    onAppendToDescription={setAppendToDescriptionFn}
                  />
                )
              ) : isMobile ? (
                <MobileNoteReadView note={note} />
              ) : (
                <DesktopNoteReadView note={note} />
              )}
            </>
          ) : isMobile ? (
            <MobileCheckListView note={note} />
          ) : (
            <DesktopCheckListView note={note} />
          )}
        </Box>
      </Box>
    </main>
  );
};
