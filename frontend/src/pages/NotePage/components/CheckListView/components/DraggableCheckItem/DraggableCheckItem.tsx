import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { CheckItem } from '../../../../api/responses';
import styles from './DraggableCheckItem.module.css';

type DraggableCheckItemProps = {
  item: CheckItem;
  children: React.ReactNode;
  dragHandle?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onFlipNode?: (id: number, node: HTMLElement | null) => void;
};

export const DraggableCheckItem: React.FC<DraggableCheckItemProps> = ({
  item,
  children,
  dragHandle,
  className,
  style,
  onFlipNode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const setRefs = useCallback(
    (node: HTMLLIElement | null) => {
      setNodeRef(node);
      onFlipNode?.(item.id, node);
    },
    [setNodeRef, onFlipNode, item.id]
  );

  return (
    <li
      ref={setRefs}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(styles.draggableItem, className)}
      {...attributes}
    >
      {dragHandle && (
        <div
          {...listeners}
          style={{
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {dragHandle}
        </div>
      )}
      {children}
    </li>
  );
};
