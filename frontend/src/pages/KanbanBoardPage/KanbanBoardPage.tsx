import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useNote } from '../NotePage/hooks/useNote/useNote';
import { CheckItem } from '../NotePage/api/responses';
import { useCheckItems, useCheckItemsQuery } from '../NotePage/components/CheckListView/hooks/useCheckItems';
import { useAddCheckItemDialog } from '../NotePage/components/CheckListView/hooks/useAddCheckItemDialog';
import { AddCheckItemDialog } from '../NotePage/components/CheckListView/components/AddCheckItemDialog/AddCheckItemDialog';
import { KanbanColumn } from './components/KanbanColumn/KanbanColumn';
import { CardDetailsDialog } from './components/CardDetailsDialog/CardDetailsDialog';
import { MobileKanbanBoard } from './components/MobileKanbanBoard/MobileKanbanBoard';
import cardStyles from './components/KanbanCard/KanbanCard.module.css';
import { useUpdateCheckItemStatus, CheckItemStatus } from './hooks/useUpdateCheckItemStatus';
import { checkItemKeys } from '../NotePage/components/CheckListView/hooks/useCheckItems';
import { useIsMobile } from '../../hooks/useIsMobile';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

type KanbanColumnConfig = {
  id: CheckItemStatus;
  title: string;
  statusColor: string;
};

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'ready', title: 'Ready for Work', statusColor: '#4f46e5' },
  { id: 'in_progress', title: 'In Progress', statusColor: '#facc15' },
  { id: 'review', title: 'Ready for Review', statusColor: '#fb923c' },
  { id: 'done', title: 'Done', statusColor: '#22c55e' },
];

const STATUS_DOT_COLORS: Record<CheckItemStatus, string> = {
  ready: '#4f46e5',
  in_progress: '#facc15',
  review: '#fb923c',
  done: '#22c55e',
};

const normalizeStatus = (item: CheckItem): CheckItemStatus => {
  if (item.doneDate) {
    return 'done';
  }
  if (
    item.status === 'in_progress' ||
    item.status === 'review' ||
    item.status === 'done'
  ) {
    return item.status;
  }
  return 'ready';
};

export const KanbanBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const queryClient = useQueryClient();
  const { note, isLoading: isNoteLoading, error: noteError } = useNote(noteId);
  const { data: checkItems = [], isLoading: isCheckItemsLoading, error: checkItemsError } =
    useCheckItemsQuery(noteId);
  const { addItem, reorderItems, updateItem } = useCheckItems(note);
  const { mutateAsync: updateStatus } = useUpdateCheckItemStatus(noteId);
  const [items, setItems] = useState<CheckItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    isOpen: isAddDialogOpen,
    value: newItemValue,
    openDialog: openAddDialog,
    closeDialog: closeAddDialog,
    changeValue: changeNewItemValue,
    saveNew,
  } = useAddCheckItemDialog();
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<CheckItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    setItems(checkItems);
  }, [checkItems]);

  const itemsByStatus = useMemo(() => {
    return KANBAN_COLUMNS.reduce<Record<CheckItemStatus, CheckItem[]>>(
      (acc, column) => {
        acc[column.id] = items.filter(
          item => normalizeStatus(item) === column.id
        );
        return acc;
      },
      { ready: [], in_progress: [], review: [], done: [] }
    );
  }, [items]);

  const getOverStatus = (overId: string | number): CheckItemStatus | null => {
    const columnMatch = KANBAN_COLUMNS.find(column => column.id === overId);
    if (columnMatch) return columnMatch.id;
    const overItem = items.find(item => item.id === overId);
    return overItem ? normalizeStatus(overItem) : null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;
    const overStatus = getOverStatus(over.id);
    if (!overStatus) return;
    const activeStatus = normalizeStatus(activeItem);
    const previousItems = items;
    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);
    let nextItems = items;
    if (overIndex !== -1 && activeIndex !== -1) {
      nextItems = arrayMove(items, activeIndex, overIndex);
    }
    nextItems = nextItems.map(item =>
      item.id === activeItem.id
        ? {
            ...item,
            status: overStatus,
            doneDate: overStatus === 'done' ? new Date().toISOString() : null,
          }
        : item
    );
    setItems(nextItems);
    try {
      if (activeStatus !== overStatus) {
        await updateStatus({ id: activeItem.id, status: overStatus });
      }
      await reorderItems(nextItems.map(item => item.id));
      queryClient.setQueryData(checkItemKeys.list(noteId), nextItems);
    } catch (error) {
      console.error('Failed to persist board update:', error);
      setItems(previousItems);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeItemId = Number(event.active.id);
    if (Number.isNaN(activeItemId)) return;
    setActiveId(activeItemId);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId
    ? items.find(item => item.id === activeId) || null
    : null;

  const getStatusDotColor = (item: CheckItem): string => {
    if (item.doneDate) {
      return STATUS_DOT_COLORS.done;
    }
    const status = normalizeStatus(item);
    return STATUS_DOT_COLORS[status] ?? STATUS_DOT_COLORS.ready;
  };

  const handleCreateOrEditCard = async () => {
    if (!noteId || !newItemValue.trim()) return;
    try {
      if (editItemId != null) {
        await updateItem(editItemId, newItemValue.trim());
        setEditItemId(null);
        closeAddDialog();
        changeNewItemValue('');
        return;
      }
      await saveNew(async () => addItem(newItemValue.trim()));
    } catch (error) {
      console.error('Failed to save card:', error);
    }
  };

  const handleEditClick = (id: number, name: string) => {
    setEditItemId(id);
    changeNewItemValue(name);
    openAddDialog();
  };

  const handleViewItemDetails = (item: CheckItem) => {
    setSelectedItemForDetails(item);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedItemForDetails(null);
  };

  const handleSaveDetails = async (
    id: number,
    name: string,
    description: string | undefined,
    status: CheckItemStatus
  ) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      // Update name and description if changed
      if (currentItem.name !== name || currentItem.description !== description) {
        await updateItem(id, name, description);
      }

      // Update status if changed
      if (currentItem.status !== status) {
        await updateStatus({ id, status });
      }

      // Update local state
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? {
                ...item,
                name,
                description,
                status,
                doneDate: status === 'done' ? new Date().toISOString() : null,
              }
            : item
        )
      );

      handleCloseDetailsDialog();
    } catch (error) {
      console.error('Failed to save card details:', error);
    }
  };

  const isMobile = useIsMobile();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: checkItemKeys.list(noteId) });
    await queryClient.invalidateQueries({ queryKey: ['note', noteId] });
  };

  if (!noteId || Number.isNaN(noteId)) {
    return (
      <Box
        component="main"
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        Missing note information.
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        p: 2,
        color: 'var(--color-text)',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
        }}
      >
        <Box component="span" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
          {note?.name || 'Kanban Board'}
        </Box>
      </Box>

      {(isNoteLoading || isCheckItemsLoading) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <CircularProgress size={18} /> Loading board...
        </Box>
      )}
      {noteError && (
        <Alert severity="error">Failed to load note information.</Alert>
      )}
      {checkItemsError && (
        <Alert severity="error">Failed to load check items.</Alert>
      )}

      {isMobile ? (
        <MobileKanbanBoard
          items={items}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onEditItem={handleEditClick}
          onViewItemDetails={handleViewItemDetails}
          activeItem={activeItem}
          onRefresh={handleRefresh}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Box
            component="section"
            sx={{
              display: 'flex',
              flex: 1,
              gap: 2,
              width: '100%',
              overflowX: 'auto',
              paddingBottom: 2,
            }}
          >
            {KANBAN_COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                statusColor={column.statusColor}
                items={itemsByStatus[column.id]}
                onEditItem={handleEditClick}
                onViewItemDetails={handleViewItemDetails}
              />
            ))}
          </Box>
          <DragOverlay>
            {activeItem ? (
              <Card className={cardStyles.card}>
                <CardContent className={cardStyles.cardContent}>
                  <span
                    className={cardStyles.statusDot}
                    style={{ backgroundColor: getStatusDotColor(activeItem) }}
                    aria-hidden="true"
                  />
                  <span className={cardStyles.cardText}>{activeItem.name}</span>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {isAddDialogOpen && (
        <AddCheckItemDialog
          isOpen={isAddDialogOpen}
          value={newItemValue}
          onChange={changeNewItemValue}
          onSave={handleCreateOrEditCard}
          onClose={closeAddDialog}
        />
      )}

      <CardDetailsDialog
        isOpen={isDetailsDialogOpen}
        item={selectedItemForDetails}
        onClose={handleCloseDetailsDialog}
        onSave={handleSaveDetails}
      />

      <Fab
        color="primary"
        aria-label="Add card"
        onClick={openAddDialog}
        sx={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};
