import React from 'react';
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
};

export const DraggableCheckItem: React.FC<DraggableCheckItemProps> = ({
  item,
  children,
  dragHandle,
  className,
  sx,
  disablePadding,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
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
