import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { CheckItem } from '../../../NotePage/api/responses';
import { KanbanCard } from '../KanbanCard/KanbanCard';
import styles from './KanbanColumn.module.css';

type KanbanColumnProps = {
  columnId: string;
  title: string;
  statusColor: string;
  items: CheckItem[];
  onEditItem: (id: number, name: string) => void;
  onViewItemDetails: (item: CheckItem) => void;
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnId,
  title,
  statusColor,
  items,
  onEditItem,
  onViewItemDetails,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      style={{ ['--status-color' as string]: statusColor }}
      className={cn(styles.column, isOver && styles.columnOver)}
      role="region"
      aria-label={`${title} column`}
    >
      <div className={styles.header}>
        <span className={styles.statusDot} aria-hidden="true" />
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.countBadge}>{items.length}</span>
      </div>
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.cardList}>
          {items.map(item => (
            <KanbanCard
              key={item.id}
              item={item}
              statusColor={statusColor}
              onEdit={onEditItem}
              onViewDetails={onViewItemDetails}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
