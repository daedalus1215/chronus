import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, Pencil, MoreVertical } from 'lucide-react';
import { CheckItem } from '../../../NotePage/api/responses';
import styles from './KanbanCard.module.css';

type KanbanCardProps = {
  item: CheckItem;
  statusColor: string;
  onEdit: (id: number, name: string) => void;
  onViewDetails: (item: CheckItem) => void;
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  statusColor,
  onViewDetails,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ['--card-accent' as string]: statusColor,
  };

  const handleCardRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
  };

  const handleViewDetailsClick = () => {
    setMenuOpen(false);
    onViewDetails(item);
  };

  return (
    <div
      ref={handleCardRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Kanban card: ${item.name}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <span
            className={styles.statusDot}
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />
          <span className={styles.cardText}>{item.name}</span>
        </div>
        <div className={styles.cardActions}>
          {item.status === 'done' && (
            <CheckCircle
              className={styles.doneIcon}
              size={20}
              aria-label="Done"
            />
          )}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={e => e.stopPropagation()}
                className={styles.moreButton}
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label="Card actions">
              <DropdownMenuItem onClick={handleViewDetailsClick}>
                <Pencil className="size-4" />
                Edit Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
