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
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnId,
  title,
  statusColorClass,
  items,
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
        backgroundColor: '#f3f4f6',
        boxShadow: isOver ? '0 0 0 2px rgba(191, 219, 254, 0.9)' : 'none',
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
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#e5e7eb',
          padding: '8px 12px',
        }}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${statusColorClass}`}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="ml-auto text-xs text-gray-500">{items.length}</span>
      </Box>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 1.5 }}>
          {items.map(item => (
            <KanbanCard
              key={item.id}
              item={item}
              statusColorClass={statusColorClass}
            />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
};
