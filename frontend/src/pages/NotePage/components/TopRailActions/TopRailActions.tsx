import React from 'react';
import { IconButton } from '@mui/material';
import {
  ViewKanban,
  Mic,
  Stop,
  ViewList,
  Create,
  MenuBook,
} from '@mui/icons-material';
import type { Note } from '../../../types';

interface TopRailActionsProps {
  note: Note | null;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  transcriptionController: {
    toggleRecording: () => Promise<void> | void;
    isRecording: boolean;
  } | null;
  onNavigateKanban: () => void;
}

export const TopRailActions: React.FC<TopRailActionsProps> = ({
  note,
  isEditMode,
  onToggleEditMode,
  isMobile,
  isSidebarOpen,
  onToggleSidebar,
  transcriptionController,
  onNavigateKanban,
}) => {
  if (!note?.isMemo) return null;

  return (
    <>
      <IconButton
        size="small"
        title={isEditMode ? 'Switch to read mode' : 'Switch to edit mode'}
        onClick={onToggleEditMode}
        aria-label={isEditMode ? 'Switch to read mode' : 'Switch to edit mode'}
        sx={{ color: 'primary.main' }}
      >
        {isEditMode ? <Create sx={{ fontSize: 16 }} /> : <MenuBook sx={{ fontSize: 16 }} />}
      </IconButton>
      <IconButton
        size="small"
        title="Kanban"
        aria-label="Kanban"
        onClick={onNavigateKanban}
      >
        <ViewKanban sx={{ fontSize: 16 }} />
      </IconButton>
      {note.isMemo && isEditMode && (
        <IconButton
          size="small"
          title={transcriptionController?.isRecording ? 'Stop recording' : 'Start recording'}
          aria-label={transcriptionController?.isRecording ? 'Stop recording' : 'Start recording'}
          onClick={() => transcriptionController?.toggleRecording()}
          disabled={!transcriptionController}
        >
          {transcriptionController?.isRecording
            ? <Stop sx={{ fontSize: 16 }} />
            : <Mic sx={{ fontSize: 16 }} />}
        </IconButton>
      )}
      {!isMobile && (
        <IconButton
          size="small"
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          onClick={onToggleSidebar}
        >
          <ViewList sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </>
  );
};
