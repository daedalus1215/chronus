import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';
import styles from './TagActionGrid.module.css';
import { ActionButton } from '@/components/ActionButton/ActionButton';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const TagActionGrid: React.FC<Props> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.actionGrid}>
        <ActionButton onClick={onEdit} label="Edit">
          <EditOutlined className={styles.icon} />
        </ActionButton>

        <ActionButton onClick={onDelete} label="Delete" danger={true}>
          <DeleteOutlineOutlined className={styles.icon} />
        </ActionButton>
      </div>
    </BottomSheet>
  );
};
