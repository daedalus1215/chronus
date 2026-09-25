import React from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  TimerOutlined,
  RecordVoiceOverOutlined,
  DriveFileMoveOutlined,
  ArchiveOutlined,
  DeleteOutlineOutlined,
  FileUploadOutlined,
  HeadphonesOutlined,
  EditOutlined,
  LabelOutlined,
  AccessTimeOutlined,
  ViewKanbanOutlined,
  NoteAltOutlined,
  FileDownloadOutlined,
  PushPin,
  PushPinOutlined,
} from '@mui/icons-material';
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
  anchorEl,
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
        <TimerOutlined className={styles.icon} />
      </ActionButton>

      <ActionButton label="View Times" onClick={onViewTimeEntries}>
        <AccessTimeOutlined className={styles.icon} />
      </ActionButton>

      <ActionButton label="Edit" onClick={onEdit}>
        <EditOutlined className={styles.icon} />
      </ActionButton>

      <ActionButton label="Board" onClick={onViewBoard}>
        <ViewKanbanOutlined className={styles.icon} />
      </ActionButton>

      {!isMemo && onConvertToMemo && (
        <ActionButton label="Convert to Memo" onClick={onConvertToMemo}>
          <NoteAltOutlined className={styles.icon} />
        </ActionButton>
      )}

      <ActionButton
        label="To Speech"
        onClick={onTextToSpeech}
        disabled={isConverting || isDownloading}
      >
        <RecordVoiceOverOutlined className={styles.icon} />
        {isConverting ? 'Converting...' : ''}
      </ActionButton>

      <ActionButton
        label="Download"
        onClick={onDownloadAudio}
        disabled={isDownloading || isConverting}
      >
        <HeadphonesOutlined className={styles.icon} />
        {isDownloading ? 'Downloading...' : ''}
      </ActionButton>

      <ActionButton
        label={`Audio History ${audioCount > 0 ? `(${audioCount})` : ''}`}
        onClick={onViewAudioHistory}
      >
        <RecordVoiceOverOutlined className={styles.icon} />
      </ActionButton>

      {audioError && <div className={styles.errorMessage}>{audioError}</div>}

      <ActionButton label="Move to Folder" onClick={onMoveToFolder}>
        <DriveFileMoveOutlined className={styles.icon} />
      </ActionButton>

      <ActionButton label="Label" onClick={onLabel}>
        <LabelOutlined className={styles.icon} />
      </ActionButton>
      <ActionButton
        label={isPinned ? 'Unpin' : 'Pin'}
        onClick={onPin}
      >
        {isPinned ? (
          <PushPin className={styles.icon} />
        ) : (
          <PushPinOutlined className={styles.icon} />
        )}
      </ActionButton>

      <ActionButton label="Archive" onClick={onArchive}>
        <ArchiveOutlined className={styles.icon} />
      </ActionButton>

      <ActionButton label="Export" onClick={onExport}>
        <FileUploadOutlined className={styles.icon} />
      </ActionButton>

      {onImportIntoNote && (
        <ActionButton label="Import Into" onClick={onImportIntoNote}>
          <FileDownloadOutlined className={styles.icon} />
        </ActionButton>
      )}

      <ActionButton label="Delete" onClick={onDelete} danger={true}>
        <DeleteOutlineOutlined className={styles.icon} />
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

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: { borderRadius: 2, width: 420, maxWidth: '90vw' },
        },
      }}
    >
      <Box sx={{ p: 1 }}>{content}</Box>
    </Popover>
  );
};
