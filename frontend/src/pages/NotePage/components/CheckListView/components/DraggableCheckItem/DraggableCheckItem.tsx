import React, { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListItem from '@mui/material/ListItem';
import { CheckItem } from '../../../../api/responses';

type DraggableCheckItemProps = {
  item: CheckItem;
  children: React.ReactNode;
  dragHandle?: React.ReactNode;
  className?: string;
  sx?: Record<string, unknown>;
  disablePadding?: boolean;
  onFlipNode?: (id: number, node: HTMLElement | null) => void;
};

export const DraggableCheckItem: React.FC<DraggableCheckItemProps> = ({
  item,
  children,
  dragHandle,
  className,
  sx,
  disablePadding,
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setRefs}
      style={style}
      className={className}
      sx={sx}
      disablePadding={disablePadding}
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
    </ListItem>
  );
};
