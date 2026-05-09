import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import { CheckItem } from '../../../NotePage/api/responses';
import { KanbanCard } from '../KanbanCard/KanbanCard';

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
        <Box
          component="span"
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: statusColor,
          }}
          aria-hidden="true"
        />
        <Box
          component="h3"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            m: 0,
          }}
        >
          {title}
        </Box>
        <Box
          component="span"
          sx={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {items.length}
        </Box>
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
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-border) transparent',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--color-border)',
              borderRadius: 2,
            },
          }}
        >
          {items.map(item => (
            <KanbanCard
              key={item.id}
              item={item}
              statusColor={statusColor}
              onEdit={onEditItem}
              onViewDetails={onViewItemDetails}
            />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
};
