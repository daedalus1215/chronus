import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { Trash2, Pencil } from 'lucide-react';
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
          <Pencil className={styles.icon} />
        </ActionButton>

        <ActionButton onClick={onDelete} label="Delete" danger={true}>
          <Trash2 className={styles.icon} />
        </ActionButton>
      </div>
    </BottomSheet>
  );
};
