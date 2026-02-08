import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import {
  TimerOutlined,
  RecordVoiceOverOutlined,
  PushPinOutlined,
  ArchiveOutlined,
  DeleteOutlineOutlined,
  StarBorderOutlined,
  FileUploadOutlined,
  HeadphonesOutlined,
  EditOutlined,
  LabelOutlined,
  AccessTimeOutlined,
  LockOutlined,
  ViewKanbanOutlined,
} from '@mui/icons-material';
import styles from './NoteActionGrid.module.css';
import { ActionButton } from '@/components/ActionButton/ActionButton';

type NoteActionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onTimeTracking: () => void;
  onViewTimeEntries: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  onArchive: () => void;
  onTextToSpeech: () => void;
  onStar: () => void;
  onExport: () => void;
  onLock: () => void;
  onEdit: () => void;
  onLabel: () => void;
  onDownloadAudio: () => void;
  onViewAudioHistory: () => void;
  onViewBoard: () => void;
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
  onPin,
  onArchive,
  onStar,
  onExport,
  onLock,
  onEdit,
  onTextToSpeech,
  onLabel,
  onViewAudioHistory,
  onViewBoard,
  isConverting = false,
  isDownloading = false,
  audioError = null,
  audioCount = 0,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
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

        <ActionButton label="Pin" onClick={onPin}>
          <PushPinOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Star" onClick={onStar}>
          <StarBorderOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Label" onClick={onLabel}>
          <LabelOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Archive" onClick={onArchive}>
          <ArchiveOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Export" onClick={onExport}>
          <FileUploadOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Lock" onClick={onLock}>
          <LockOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton label="Delete" onClick={onDelete} danger={true}>
          <DeleteOutlineOutlined className={styles.icon} />
        </ActionButton>
      </div>
    </BottomSheet>
  );
};
