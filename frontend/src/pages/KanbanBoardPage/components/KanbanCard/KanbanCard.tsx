import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CheckItem } from '../../../NotePage/api/responses';
import styles from './KanbanCard.module.css';

type KanbanCardProps = {
  item: CheckItem;
  statusColorClass: string;
  onEdit: (id: number, name: string) => void;
  onViewDetails: (item: CheckItem) => void;
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  statusColorClass,
  onEdit,
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = () => {
    closeMenu();
    onEdit(item.id, item.name);
  };

  const handleViewDetailsClick = () => {
    closeMenu();
    onViewDetails(item);
  };

  return (
    <Card
      ref={handleCardRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Kanban card: ${item.name}`}
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
          <span className={styles.cardText}>
            {item.name}
          </span>
        </div>
        <div className={styles.cardActions}>
          {item.status === 'done' && (
            <CheckCircleIcon
              className={styles.doneIcon}
              fontSize="small"
              aria-label="Done"
            />
          )}
          <IconButton
            size="small"
            onClick={handleMenuClick}
            className={styles.moreButton}
            aria-label="More options"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </div>
      </CardContent>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          'aria-label': 'Card actions',
        }}
      >
        <MenuItem onClick={handleViewDetailsClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};
