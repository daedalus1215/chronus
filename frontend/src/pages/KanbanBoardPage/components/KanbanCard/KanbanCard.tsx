import React, { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { CheckItem } from '../../../NotePage/api/responses';
import styles from './KanbanCard.module.css';

type KanbanCardProps = {
  item: CheckItem;
  statusColorClass: string;
  onEdit: (id: number, name: string) => void;
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  statusColorClass,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    setNodeRef(node);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  };

  const openMenu = () => {
    if (cardRef.current) {
      setMenuAnchor(cardRef.current);
    }
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = window.setTimeout(() => {
      openMenu();
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleEditClick = () => {
    closeMenu();
    onEdit(item.id, item.name);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <Card
      ref={handleCardRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Kanban card: ${item.name}`}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className={styles.cardContent}>
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        >
          <span
            className={`${styles.statusDot} ${statusColorClass}`}
            aria-hidden="true"
          />
          <span
            className={styles.cardText}
          >
            {item.name}
          </span>
        </div>
        {item.status === 'done' && (
          <CheckCircleIcon
            className={styles.doneIcon}
            fontSize="small"
            aria-label="Done"
          />
        )}
      </CardContent>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        MenuListProps={{
          onMouseLeave: closeMenu,
          'aria-label': 'Card actions',
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
      </Menu>
    </Card>
  );
};
