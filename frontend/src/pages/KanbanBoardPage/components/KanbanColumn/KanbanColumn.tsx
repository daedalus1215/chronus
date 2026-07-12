import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
        position: 'relative',
        flex: '1 1 0%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        background: isOver ? 'var(--accent-soft)' : 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: isOver ? 'var(--glow-accent)' : 'var(--elevation-2)',
        transition:
          'background 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out)',
        height: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${statusColor} 0%, ${statusColor}66 100%)`,
          opacity: 0.9,
        },
      }}
      role="region"
      aria-label={`${title} column`}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid var(--glass-border)',
          padding: '10px 14px',
        }}
      >
        <Box
          component="span"
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: statusColor,
            boxShadow: `0 0 0 3px ${statusColor}22, 0 0 10px ${statusColor}88`,
          }}
          aria-hidden="true"
        />
        <Box
          component="h3"
          sx={{
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
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
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 20,
            px: 0.75,
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            color: statusColor,
            backgroundColor: `${statusColor}1f`,
            border: `1px solid ${statusColor}33`,
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
