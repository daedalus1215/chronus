import React from 'react';
import {
  Timer,
  Mic,
  FolderInput,
  Archive,
  Trash2,
  Upload,
  Headphones,
  Pencil,
  Tag,
  Clock,
  Kanban,
  NotebookPen,
  Download,
  Pin,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './NoteActionGrid.module.css';
import { ActionButton } from '@/components/ActionButton/ActionButton';

type NoteActionsProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The ⋮ button the desktop popover anchors to. Ignored on mobile (bottom sheet). */
  anchorEl?: HTMLElement | null;
  onTimeTracking: () => void;
  onViewTimeEntries: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  isPinned?: boolean;
  onMoveToFolder: () => void;
  onArchive: () => void;
  onTextToSpeech: () => void;
  onExport: () => void;
  onImportIntoNote?: () => void;
  onEdit: () => void;
  onLabel: () => void;
  onDownloadAudio: () => void;
  onViewAudioHistory: () => void;
  onViewBoard: () => void;
  onConvertToMemo?: () => void;
  isMemo?: boolean;
  isConverting?: boolean;
  isDownloading?: boolean;
  audioError?: string | null;
  audioCount?: number;
};

export const NoteActionsGrid: React.FC<NoteActionsProps> = ({
  isOpen,
  onClose,
  onTimeTracking,
  onViewTimeEntries,
  onDelete,
  onDownloadAudio,
  onMoveToFolder,
  onArchive,
  onExport,
  onImportIntoNote,
  onEdit,
  onTextToSpeech,
  onLabel,
  onPin,
  isPinned = false,
  onViewAudioHistory,
  onViewBoard,
  onConvertToMemo,
  isMemo = false,
  isConverting = false,
  isDownloading = false,
  audioError = null,
  audioCount = 0,
}) => {
  const isMobile = useIsMobile();

  const content = (
    <div className={styles.actionGrid}>
      <ActionButton label="Time Entry" onClick={onTimeTracking}>
        <Timer className={styles.icon} />
      </ActionButton>

      <ActionButton label="View Times" onClick={onViewTimeEntries}>
        <Clock className={styles.icon} />
      </ActionButton>

      <ActionButton label="Edit" onClick={onEdit}>
        <Pencil className={styles.icon} />
      </ActionButton>

      <ActionButton label="Board" onClick={onViewBoard}>
        <Kanban className={styles.icon} />
      </ActionButton>

      {!isMemo && onConvertToMemo && (
        <ActionButton label="Convert to Memo" onClick={onConvertToMemo}>
          <NotebookPen className={styles.icon} />
        </ActionButton>
      )}

      <ActionButton
        label="To Speech"
        onClick={onTextToSpeech}
        disabled={isConverting || isDownloading}
      >
        <Mic className={styles.icon} />
        {isConverting ? 'Converting...' : ''}
      </ActionButton>

      <ActionButton
        label="Download"
        onClick={onDownloadAudio}
        disabled={isDownloading || isConverting}
      >
        <Headphones className={styles.icon} />
        {isDownloading ? 'Downloading...' : ''}
      </ActionButton>

      <ActionButton
        label={`Audio History ${audioCount > 0 ? `(${audioCount})` : ''}`}
        onClick={onViewAudioHistory}
      >
        <Mic className={styles.icon} />
      </ActionButton>

      {audioError && <div className={styles.errorMessage}>{audioError}</div>}

      <ActionButton label="Move to Folder" onClick={onMoveToFolder}>
        <FolderInput className={styles.icon} />
      </ActionButton>

      <ActionButton label="Tags" onClick={onLabel}>
        <Tag className={styles.icon} />
      </ActionButton>
      <ActionButton
        label={isPinned ? 'Unpin' : 'Pin'}
        onClick={onPin}
      >
        <Pin className={styles.icon} fill={isPinned ? 'currentColor' : 'none'} />
      </ActionButton>

      <ActionButton label="Archive" onClick={onArchive}>
        <Archive className={styles.icon} />
      </ActionButton>

      <ActionButton label="Export" onClick={onExport}>
        <Upload className={styles.icon} />
      </ActionButton>

      {onImportIntoNote && (
        <ActionButton label="Import Into" onClick={onImportIntoNote}>
          <Download className={styles.icon} />
        </ActionButton>
      )}

      <ActionButton label="Delete" onClick={onDelete} danger={true}>
        <Trash2 className={styles.icon} />
      </ActionButton>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        {content}
      </BottomSheet>
    );
  }

  // Desktop previously rendered this in an MUI Popover anchored to the ⋮
  // button via `anchorEl` — but no caller ever actually passes anchorEl,
  // so it always rendered anchorless anyway. A centered Dialog is the
  // honest equivalent rather than reproducing an anchor that never worked.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[420px] max-w-[90vw] gap-0 p-1">
        <DialogTitle className="sr-only">Note actions</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
};
