import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import {
  DeleteOutlineOutlined,
  EditOutlined,
} from '@mui/icons-material';
import styles from './TagActionGrid.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TagActionGrid: React.FC<Props> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.actionGrid}>

        <button
          onClick={onEdit}
          className={styles.actionButton}
        >
          <EditOutlined className={styles.icon} />
          <span className={styles.label}>Edit</span>
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