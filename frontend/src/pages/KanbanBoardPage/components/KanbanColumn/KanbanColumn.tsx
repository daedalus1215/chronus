import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import { CheckItem } from '../../../NotePage/api/responses';
import { KanbanCard } from '../KanbanCard/KanbanCard';

type KanbanColumnProps = {
  columnId: string;
  title: string;
  statusColorClass: string;
  items: CheckItem[];
  onEditItem: (id: number, name: string) => void;
  onViewItemDetails: (item: CheckItem) => void;
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnId,
  title,
  statusColorClass,
  items,
  onEditItem,
  onViewItemDetails,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: '1 1 0%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        backgroundColor: 'var(--color-bg-elevated)',
        boxShadow: isOver ? '0 0 0 2px var(--color-border-accent)' : 'none',
        height: '100%',
      }}
      role="region"
      aria-label={`${title} column`}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-elevated-2)',
          padding: '8px 12px',
        }}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusColorClass}`}
          aria-hidden="true"
        />
        <h3 className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
        <span
          className="ml-auto text-[11px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {items.length}
        </span>
      </Box>
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            padding: 1.5,
            flex: 1,
            minHeight: 120,
            overflowY: 'auto',
          }}
        >
          {items.map(item => (
            <KanbanCard
              key={item.id}
              item={item}
              statusColorClass={statusColorClass}
              onEdit={onEditItem}
              onViewDetails={onViewItemDetails}
            />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
};
