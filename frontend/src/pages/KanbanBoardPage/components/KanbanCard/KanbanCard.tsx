import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CheckItem } from '../../../NotePage/api/responses';

type KanbanCardProps = {
  item: CheckItem;
  statusColorClass: string;
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  statusColorClass,
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
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-gray-200 ${isDragging ? 'shadow-md opacity-70' : 'shadow-sm'}`}
      role="button"
      tabIndex={0}
      aria-label={`Kanban card: ${item.name}`}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
    >
      <CardContent className="flex items-start gap-2 px-3 py-2">
        <span
          className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusColorClass}`}
          aria-hidden="true"
        />
        <span className="text-sm text-gray-800 break-words">{item.name}</span>
        {item.status === 'done' && (
          <CheckCircleIcon
            className="ml-auto text-green-500"
            fontSize="small"
            aria-label="Done"
          />
        )}
      </CardContent>
    </Card>
  );
};
