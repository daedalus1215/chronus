import React from 'react';
import { Button } from '@/components/ui/button';
import { Kanban, Mic, Square, Pencil, BookOpen, Tag } from 'lucide-react';
import { SidebarToggleIcon } from '@components/Header/Sidebar/SidebarToggleIcon';
import { Note } from '../../api/responses';

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
  onToggleTags?: () => void;
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
  onToggleTags,
}) => {
  if (!note) return null;

  return (
    <>
      {note.isMemo && (
        <Button
          variant="ghost"
          size="icon-sm"
          title={isEditMode ? 'Switch to read mode' : 'Switch to edit mode'}
          onClick={onToggleEditMode}
          aria-label={isEditMode ? 'Switch to read mode' : 'Switch to edit mode'}
          className="text-primary"
        >
          {isEditMode ? (
            <Pencil className="size-4" />
          ) : (
            <BookOpen className="size-4" />
          )}
        </Button>
      )}
      {note.isMemo && (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Kanban"
          aria-label="Kanban"
          onClick={onNavigateKanban}
        >
          <Kanban className="size-4" />
        </Button>
      )}
      {isMobile && onToggleTags && (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Open side panel"
          aria-label="Open side panel"
          onClick={onToggleTags}
        >
          <Tag className="size-4" />
        </Button>
      )}
      {note.isMemo && isEditMode && (
        <Button
          variant="ghost"
          size="icon-sm"
          title={
            transcriptionController?.isRecording
              ? 'Stop recording'
              : 'Start recording'
          }
          aria-label={
            transcriptionController?.isRecording
              ? 'Stop recording'
              : 'Start recording'
          }
          onClick={() => transcriptionController?.toggleRecording()}
          disabled={!transcriptionController}
        >
          {transcriptionController?.isRecording ? (
            <Square className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </Button>
      )}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon-sm"
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          onClick={onToggleSidebar}
        >
          <SidebarToggleIcon inverted isOpen={isSidebarOpen} size={16} />
        </Button>
      )}
    </>
  );
};
