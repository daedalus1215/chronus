import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import PullToRefresh from 'react-pull-to-refresh';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, pointerWithin, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CheckItem } from '../../../NotePage/api/responses';
import { CheckItemStatus } from '../../hooks/useUpdateCheckItemStatus';
import { KanbanCard } from '../KanbanCard/KanbanCard';
import styles from './MobileKanbanBoard.module.css';

type KanbanColumnConfig = {
  id: CheckItemStatus;
  title: string;
  statusColor: string;
};

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'ready', title: 'Ready', statusColor: '#4f46e5' },
  { id: 'in_progress', title: 'In Progress', statusColor: '#facc15' },
  { id: 'review', title: 'Review', statusColor: '#fb923c' },
  { id: 'done', title: 'Done', statusColor: '#22c55e' },
];

type MobileKanbanBoardProps = {
  items: CheckItem[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onEditItem: (id: number, name: string) => void;
  onViewItemDetails: (item: CheckItem) => void;
  activeItem: CheckItem | null;
  onRefresh: () => Promise<unknown>;
};

export const MobileKanbanBoard: React.FC<MobileKanbanBoardProps> = ({
  items,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onEditItem,
  onViewItemDetails,
  activeItem,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const activeColumn = KANBAN_COLUMNS[activeTab];
  
  const itemsByStatus = KANBAN_COLUMNS.reduce<Record<CheckItemStatus, CheckItem[]>>(
    (acc, column) => {
      acc[column.id] = items.filter(item => {
        if (item.doneDate) return column.id === 'done';
        return item.status === column.id;
      });
      return acc;
    },
    { ready: [], in_progress: [], review: [], done: [] }
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab < KANBAN_COLUMNS.length - 1) {
        setActiveTab(activeTab + 1);
      }
    },
    onSwipedRight: () => {
      if (activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
    },
    trackMouse: false,
  });

  const currentItems = itemsByStatus[activeColumn.id];

  return (
    <Box className={styles.mobileContainer} {...swipeHandlers}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        className={styles.tabs}
        TabIndicatorProps={{
          style: { backgroundColor: activeColumn.statusColor },
        }}
      >
        {KANBAN_COLUMNS.map((column) => (
          <Tab
            key={column.id}
            label={
              <Badge
                badgeContent={itemsByStatus[column.id].length}
                color="default"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: column.statusColor,
                    color: column.id === 'in_progress' ? '#000' : '#fff',
                    fontSize: '10px',
                    minWidth: '16px',
                    height: '16px',
                  },
                }}
              >
                <span style={{ marginRight: '20px' }}>{column.title}</span>
              </Badge>
            }
            className={styles.tab}
          />
        ))}
      </Tabs>

      <PullToRefresh onRefresh={onRefresh} className={styles.pullToRefresh}>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <Box className={styles.columnContainer}>
            <SortableContext
              items={currentItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Box className={styles.cardsContainer}>
                {currentItems.map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    statusColorClass={activeColumn.statusColor}
                    onEdit={onEditItem}
                    onViewDetails={onViewItemDetails}
                  />
                ))}
              </Box>
            </SortableContext>
          </Box>
          <DragOverlay>
            {activeItem ? (
              <div className={styles.dragOverlay}>
                <KanbanCard
                  item={activeItem}
                  statusColorClass={activeColumn.statusColor}
                  onEdit={() => {}}
                  onViewDetails={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </PullToRefresh>
    </Box>
  );
};
