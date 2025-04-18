import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import {
  TimerOutlined,
  ShareOutlined,
  ContentCopyOutlined,
  PushPinOutlined,
  ArchiveOutlined,
  DeleteOutlineOutlined,
  StarBorderOutlined,
  FileUploadOutlined,
  LockOutlined,
  EditOutlined,
  LabelOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import styles from './NoteActionGrid.module.css';

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
  onStar: () => void;
  onExport: () => void;
  onLock: () => void;
  onEdit: () => void;
  onLabel: () => void;
}

export const NoteActionsGrid: React.FC<NoteActionsProps> = ({
  isOpen,
  onClose,
  onTimeTracking,
  onViewTimeEntries,
  onDelete,
  onShare,
  onDuplicate,
  onPin,
  onArchive,
  onStar,
  onExport,
  onLock,
  onEdit,
  onLabel
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.actionGrid}>
        <button 
          onClick={onTimeTracking}
          className={styles.actionButton}
        >
          <TimerOutlined className={styles.icon} />
          <span className={styles.label}>Time Entry</span>
        </button>
        <button 
          onClick={onViewTimeEntries}
          className={styles.actionButton}
        >
          <AccessTimeOutlined className={styles.icon} />
          <span className={styles.label}>View Times</span>
        </button>
        <button 
          onClick={onEdit} 
          className={styles.actionButton}
        >
          <EditOutlined className={styles.icon} />
          <span className={styles.label}>Edit</span>
        </button>
        <button 
          onClick={onShare} 
          className={styles.actionButton}
        >
          <ShareOutlined className={styles.icon} />
          <span className={styles.label}>Share</span>
        </button>
        <button 
          onClick={onDuplicate} 
          className={styles.actionButton}
        >
          <ContentCopyOutlined className={styles.icon} />
          <span className={styles.label}>Copy</span>
        </button>
        <button 
          onClick={onPin} 
          className={styles.actionButton}
        >
          <PushPinOutlined className={styles.icon} />
          <span className={styles.label}>Pin</span>
        </button>
        <button 
          onClick={onStar} 
          className={styles.actionButton}
        >
          <StarBorderOutlined className={styles.icon} />
          <span className={styles.label}>Star</span>
        </button>
        <button 
          onClick={onLabel} 
          className={styles.actionButton}
        >
          <LabelOutlined className={styles.icon} />
          <span className={styles.label}>Label</span>
        </button>
        <button 
          onClick={onArchive} 
          className={styles.actionButton}
        >
          <ArchiveOutlined className={styles.icon} />
          <span className={styles.label}>Archive</span>
        </button>
        <button 
          onClick={onExport} 
          className={styles.actionButton}
        >
          <FileUploadOutlined className={styles.icon} />
          <span className={styles.label}>Export</span>
        </button>
        <button 
          onClick={onLock} 
          className={styles.actionButton}
        >
          <LockOutlined className={styles.icon} />
          <span className={styles.label}>Lock</span>
        </button>
        <button 
          onClick={onDelete} 
          className={styles.actionButton}
          data-variant="danger"
        >
          <DeleteOutlineOutlined className={styles.icon} />
          <span className={styles.label}>Delete</span>
        </button>
      </div>
    </BottomSheet>
  );
}; 