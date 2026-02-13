import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
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
  statusColorClass: string;
};

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'ready', title: 'Ready for Work', statusColorClass: '#4f46e5' },
  { id: 'in_progress', title: 'In Progress', statusColorClass: 'bg-yellow-400' },
  { id: 'review', title: 'Ready for Review', statusColorClass: 'bg-orange-400' },
  { id: 'done', title: 'Done', statusColorClass: 'bg-green-500' },
];

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
  const navigate = useNavigate();
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

  const getStatusDotClass = (item: CheckItem): string => {
    if (item.doneDate) return 'bg-green-500';
    if (item.status === 'in_progress') return 'bg-yellow-400';
    if (item.status === 'review') return 'bg-orange-400';
    return 'bg-green-500';
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
      <main className="flex h-full items-center justify-center text-sm text-gray-500">
        Missing note information.
      </main>
    );
  }

  return (
    <main
      className="flex h-full flex-col gap-4 p-4"
      style={{
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        padding: '16px',
        color: 'var(--color-text)',
      }}
    >
      <header className="flex flex-wrap items-center gap-2">
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Go back"
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">
            {note?.name || 'Kanban Board'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => navigate(`/notes/${noteId}`)}
            size="small"
            sx={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              '&:hover': { borderColor: 'var(--color-border-accent)' },
            }}
          >
            Checklist View
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            size="small"
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            Add Card
          </Button>
        </div>
      </header>

      {(isNoteLoading || isCheckItemsLoading) && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CircularProgress size={18} /> Loading board...
        </div>
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
                statusColorClass={column.statusColorClass}
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
                    className={`${cardStyles.statusDot} ${getStatusDotClass(activeItem)}`}
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
    </main>
  );
};
