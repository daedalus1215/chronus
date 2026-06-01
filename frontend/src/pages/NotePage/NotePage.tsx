import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNote } from './hooks/useNote/useNote';
import { useTitle } from './hooks/useTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HeadsetMicOutlined from '@mui/icons-material/HeadsetMicOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTopRailActions } from '../../hooks/useTopRailActions';
import { TopRailActions } from './components/TopRailActions/TopRailActions';
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
import { SidebarTagsView } from './components/SidebarTagsView/SidebarTagsView';
import { MobileTagsView } from './components/MobileTagsView/MobileTagsView';
import styles from './NotePage.module.css';
import { ChecklistOutlined } from '@mui/icons-material';
import { AudioHistoryView } from './components/AudioHistoryView/AudioHistoryView';
import { TimeTrackHistoryView } from './components/TimeTrackHistoryView/TimeTrackHistoryView';

const SIDEBAR_TAB_STORAGE_KEY = 'chronus-sidebar-tab';

const sidebarTabs = [
  { id: 'checklist', icon: <ChecklistOutlined /> },
  { id: 'tags', icon: <LocalOfferIcon /> },
  { id: 'audio', icon: <HeadsetMicOutlined /> },
  { id: 'time', icon: <AccessTimeOutlined /> },
];

export const NotePage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const { note, isLoading, error, updateNote } = useNote(noteId);
  const {
    title,
    setTitle,
    loading: titleLoading,
    error: titleError,
  } = useTitle(note);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [transcriptionController, setTranscriptionController] = useState<{
    toggleRecording: () => Promise<void> | void;
    isRecording: boolean;
    isInitializing: boolean;
    micAvailable: boolean | null;
    getStatusText: () => string;
  } | null>(null);

  // Active tab with localStorage persistence
  const [activeTab, setActiveTab] = useState<string>(() => {
    const stored = localStorage.getItem(SIDEBAR_TAB_STORAGE_KEY);
    return stored && sidebarTabs.some(t => t.id === stored) ? stored : 'checklist';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const { setAppendToDescriptionFn, onTranscription: onTranscriptionCallback } =
    useTranscriptionCallback();

  const handleToggleEditMode = useCallback(
    () => setIsEditMode(prev => !prev),
    []
  );

  const handleToggleSidebar = useCallback(
    () => setIsSidebarOpen(prev => !prev),
    []
  );

  const handleToggleTags = useCallback(
    () => setIsTagsOpen(prev => !prev),
    []
  );

  const handleNavigateKanban = useCallback(
    () => navigate(`/notes/${note?.id}/kanban`),
    [navigate, note?.id]
  );

  const topRailActions = useMemo(
    () => (
      <TopRailActions
        note={note}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        transcriptionController={transcriptionController}
        onNavigateKanban={handleNavigateKanban}
        onToggleTags={handleToggleTags}
      />
    ),
    [
      note,
      isEditMode,
      handleToggleEditMode,
      isMobile,
      isSidebarOpen,
      handleToggleSidebar,
      transcriptionController,
      handleNavigateKanban,
      handleToggleTags,
    ]
  );

  useTopRailActions(topRailActions);

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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading note
            </Alert>
          )}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
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

        </Box>
        {!isMobile && note?.isMemo && (
          <RightSidebar
            isOpen={isSidebarOpen}
            title=""
            tabs={sidebarTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          >
            {activeTab === 'checklist' && note && (
              <SidebarChecklistView note={note} />
            )}
            {activeTab === 'tags' && (
              <SidebarTagsView noteId={noteId} />
            )}
            {activeTab === 'audio' && noteId && (
              <AudioHistoryView noteId={noteId} />
            )}
            {activeTab === 'time' && noteId && (
              <TimeTrackHistoryView noteId={noteId} />
            )}
          </RightSidebar>
        )}
        {isMobile && note?.isMemo && (
          <MobileTagsView
            note={note}
            noteId={noteId}
            tabs={sidebarTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOpen={isTagsOpen}
            onClose={() => setIsTagsOpen(false)}
          />
        )}
      </Box>
    </main>
  );
};
