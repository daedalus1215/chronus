import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNote } from './hooks/useNote/useNote';
import { useTitle } from './hooks/useTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Tag, useNoteTags } from './hooks/useNoteTags';
import { AddTagForm } from './components/AddTagForm/AddTagForm';
import { useAllTags } from './hooks/useAllTags';
import {
  Chip,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Add,
  Close,
  Edit,
  ViewKanban,
  ViewList,
  EditOff,
  MoreVert,
  Label,
  Mic,
  Stop,
} from '@mui/icons-material';
import { useIsMobile } from '../../hooks/useIsMobile';
import { DesktopNoteEditor } from './components/NoteEditor/DesktopNoteEditor/DesktopNoteEditor';
import { MobileNoteEditor } from './components/NoteEditor/MobileNoteEditor/MobileNoteEditor';
import { DesktopNoteReadView } from './components/NoteReadView/DesktopNoteReadView/DesktopNoteReadView';
import { MobileNoteReadView } from './components/NoteReadView/MobileNoteReadView/MobileNoteReadView';
import { DesktopCheckListView } from './components/CheckListView/DesktopCheckListView/DesktopCheckListView';
import { MobileCheckListView } from './components/CheckListView/MobileCheckListView/MobileCheckListView';
import { TranscriptionRecorder } from './components/TranscriptionRecorder/TranscriptionRecorder';
import { useTranscriptionCallback } from './hooks/useTranscriptionCallback/useTranscriptionCallback';
import { RightSidebar } from './components/RightSidebar/RightSidebar';
import { SidebarChecklistView } from './components/SidebarChecklistView/SidebarChecklistView';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fabMenuAnchor, setFabMenuAnchor] = useState<null | HTMLElement>(null);
  const isFabMenuOpen = Boolean(fabMenuAnchor);
  const [transcriptionController, setTranscriptionController] = useState<{
    toggleRecording: () => Promise<void> | void;
    isRecording: boolean;
    isInitializing: boolean;
    micAvailable: boolean | null;
    getStatusText: () => string;
  } | null>(null);

  const handleFabMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFabMenuAnchor(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setFabMenuAnchor(null);
  };

  const handleFabEdit = () => {
    handleFabMenuClose();
    if (isEditMode) {
      handleCancelEdit();
    } else {
      handleEditClick();
    }
  };

  const handleFabKanban = () => {
    handleFabMenuClose();
    navigate(`/notes/${note.id}/kanban`);
  };

  const handleFabAddTag = () => {
    handleFabMenuClose();
    setAddTagOpen(true);
  };

  const handleFabShowChecklist = () => {
    handleFabMenuClose();
    setIsSidebarOpen(prev => !prev);
  };

  const handleFabToggleRecording = () => {
    handleFabMenuClose();
    if (!transcriptionController) {
      return;
    }
    transcriptionController.toggleRecording();
  };

  const handleCloseSidebar = (): void => {
    setIsSidebarOpen(false);
  };

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
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          minHeight: 0,
          overflowX: 'auto',
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 280,
            minHeight: 0,
          }}
        >
          <Box className="flex items-center gap-2 overflow-x-auto py-2">
            <IconButton
              onClick={() => setAddTagOpen(true)}
              color="secondary"
              size="small"
              aria-label="Add tag"
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

          <Dialog
            open={isAddTagOpen}
            onClose={() => setAddTagOpen(false)}
            maxWidth="sm"
            fullWidth
            aria-labelledby="add-tag-dialog-title"
          >
            <DialogTitle id="add-tag-dialog-title">Add tag to note</DialogTitle>
            <DialogContent>
              {allTagsLoading ? (
                <span className="text-gray-400 ml-2">Loading all tags...</span>
              ) : allTagsError ? (
                <span className="text-red-500 ml-2">
                  Error loading all tags
                </span>
              ) : (
                <AddTagForm
                  noteId={Number(id)}
                  tags={addTagOptions}
                  onTagAdded={refetch}
                  onClose={() => setAddTagOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading note
            </Alert>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
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
              multiline
              minRows={1}
              maxRows={4}
            />
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
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
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
                      useOwnFab={false}
                      onControllerReady={setTranscriptionController}
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

          {note?.isMemo && (
            <>
              <Fab
                color="primary"
                aria-label="Note actions"
                aria-haspopup="menu"
                aria-expanded={isFabMenuOpen}
                onClick={handleFabMenuOpen}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                }}
              >
                <MoreVert />
              </Fab>
              <Menu
                anchorEl={fabMenuAnchor}
                open={isFabMenuOpen}
                onClose={handleFabMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 200 },
                  },
                }}
              >
                <MenuItem onClick={handleFabEdit}>
                  <ListItemIcon>
                    {isEditMode ? (
                      <EditOff fontSize="small" />
                    ) : (
                      <Edit fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    {isEditMode ? 'Read mode' : 'Edit mode'}
                  </ListItemText>
                </MenuItem>
                <MenuItem onClick={handleFabKanban}>
                  <ListItemIcon>
                    <ViewKanban fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Kanban</ListItemText>
                </MenuItem>
                {note?.isMemo && isEditMode && (
                  <MenuItem
                    onClick={handleFabToggleRecording}
                    disabled={!transcriptionController}
                  >
                    <ListItemIcon>
                      {transcriptionController?.isRecording ? (
                        <Stop fontSize="small" />
                      ) : (
                        <Mic fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText>
                      {transcriptionController?.isRecording
                        ? 'Stop recording'
                        : 'Start recording'}
                    </ListItemText>
                  </MenuItem>
                )}
                {!isMobile && (
                  <MenuItem onClick={handleFabShowChecklist}>
                    <ListItemIcon>
                      <ViewList fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                      {isSidebarOpen ? 'Hide checklist' : 'Show checklist'}
                    </ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={handleFabAddTag}>
                  <ListItemIcon>
                    <Label fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add tag</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
        {!isMobile && note?.isMemo && (
          <RightSidebar
            isOpen={isSidebarOpen}
            title=""
            onClose={handleCloseSidebar}
          >
            <SidebarChecklistView note={note} />
          </RightSidebar>
        )}
      </Box>
    </main>
  );
};
