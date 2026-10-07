import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import PullToRefresh from 'react-pull-to-refresh';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  onMoveToStatus: (itemId: number, status: CheckItemStatus) => void;
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
  onMoveToStatus,
  activeItem,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const activeColumn = KANBAN_COLUMNS[activeTab];

  const itemsByStatus = KANBAN_COLUMNS.reduce<
    Record<CheckItemStatus, CheckItem[]>
  >(
    (acc, column) => {
      acc[column.id] = items.filter(item => {
        if (item.doneDate) return column.id === 'done';
        return item.status === column.id;
      });
      return acc;
    },
    { ready: [], in_progress: [], review: [], done: [] }
  );

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
  const prevColumn = activeTab > 0 ? KANBAN_COLUMNS[activeTab - 1] : null;
  const nextColumn =
    activeTab < KANBAN_COLUMNS.length - 1
      ? KANBAN_COLUMNS[activeTab + 1]
      : null;

  return (
    <div className={styles.mobileContainer} {...swipeHandlers}>
      <Tabs value={String(activeTab)} onValueChange={v => setActiveTab(Number(v))}>
        <TabsList
          variant="line"
          className={`${styles.tabs} w-full justify-start overflow-x-auto rounded-none bg-[var(--color-bg-elevated)]`}
        >
          {KANBAN_COLUMNS.map((column, index) => (
            <TabsTrigger
              key={column.id}
              value={String(index)}
              style={{ ['--tab-color' as string]: column.statusColor }}
              className={`${styles.tab} flex-none shrink-0 after:bg-[var(--tab-color)]`}
            >
              <span className="mr-2">{column.title}</span>
              <Badge
                className="h-4 min-w-4 px-1 text-[10px]"
                style={{
                  backgroundColor: column.statusColor,
                  color: column.id === 'in_progress' ? '#000' : '#fff',
                }}
              >
                {itemsByStatus[column.id].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <PullToRefresh onRefresh={onRefresh} className={styles.pullToRefresh}>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div className={styles.columnContainer}>
            <SortableContext
              items={currentItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.cardsContainer}>
                {currentItems.map(item => (
                  <div key={item.id} className={styles.cardWrapper}>
                    <KanbanCard
                      item={item}
                      statusColor={activeColumn.statusColor}
                      onEdit={onEditItem}
                      onViewDetails={onViewItemDetails}
                    />
                    {(prevColumn || nextColumn) && (
                      <div className={styles.columnNav}>
                        {prevColumn ? (
                          <Badge
                            variant="outline"
                            className="h-[22px] cursor-pointer text-[0.65rem]"
                            style={{
                              borderColor: prevColumn.statusColor,
                              color: prevColumn.statusColor,
                            }}
                            onClick={() => onMoveToStatus(item.id, prevColumn.id)}
                          >
                            ← {prevColumn.title}
                          </Badge>
                        ) : (
                          <span />
                        )}
                        {nextColumn && (
                          <Badge
                            variant="outline"
                            className="h-[22px] cursor-pointer text-[0.65rem]"
                            style={{
                              borderColor: nextColumn.statusColor,
                              color: nextColumn.statusColor,
                            }}
                            onClick={() => onMoveToStatus(item.id, nextColumn.id)}
                          >
                            {nextColumn.title} →
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
          <DragOverlay>
            {activeItem ? (
              <div className={styles.dragOverlay}>
                <KanbanCard
                  item={activeItem}
                  statusColor={activeColumn.statusColor}
                  onEdit={() => {}}
                  onViewDetails={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </PullToRefresh>
    </div>
  );
};
