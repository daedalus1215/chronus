import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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
import { useUpdateCheckItemStatus, CheckItemStatus } from './hooks/useUpdateCheckItemStatus';

type KanbanColumnConfig = {
  id: CheckItemStatus;
  title: string;
  statusColorClass: string;
};

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'ready', title: 'Ready for Work', statusColorClass: 'bg-green-500' },
  { id: 'in_progress', title: 'In Progress', statusColorClass: 'bg-yellow-400' },
  { id: 'review', title: 'Ready for Review', statusColorClass: 'bg-orange-400' },
  { id: 'done', title: 'Done', statusColorClass: 'bg-green-500' },
];

const normalizeStatus = (status?: CheckItemStatus): CheckItemStatus => {
  if (status === 'in_progress' || status === 'review' || status === 'done') {
    return status;
  }
  return 'ready';
};

export const KanbanBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const { note, isLoading: isNoteLoading, error: noteError } = useNote(noteId);
  const { data: checkItems = [], isLoading: isCheckItemsLoading, error: checkItemsError } =
    useCheckItemsQuery(noteId);
  const { addItem } = useCheckItems(note);
  const { mutate: updateStatus } = useUpdateCheckItemStatus(noteId);
  const [items, setItems] = useState<CheckItem[]>([]);
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

  useEffect(() => {
    setItems(checkItems);
  }, [checkItems]);

  const itemsByStatus = useMemo(() => {
    return KANBAN_COLUMNS.reduce<Record<CheckItemStatus, CheckItem[]>>(
      (acc, column) => {
        acc[column.id] = items.filter(
          item => normalizeStatus(item.status) === column.id
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
    return overItem ? normalizeStatus(overItem.status) : null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;
    const overStatus = getOverStatus(over.id);
    if (!overStatus) return;
    const activeStatus = normalizeStatus(activeItem.status);
    const isSameStatus = activeStatus === overStatus;
    if (isSameStatus) {
      const activeIndex = items.findIndex(item => item.id === active.id);
      const overIndex = items.findIndex(item => item.id === over.id);
      if (overIndex === -1 || activeIndex === overIndex) return;
      setItems(arrayMove(items, activeIndex, overIndex));
      return;
    }
    const updatedItems = items.map(item =>
      item.id === activeItem.id
        ? {
            ...item,
            status: overStatus,
            doneDate: overStatus === 'done' ? new Date().toISOString() : null,
          }
        : item
    );
    setItems(updatedItems);
    updateStatus({ id: activeItem.id, status: overStatus });
  };

  const handleCreateCard = async () => {
    if (!noteId || !newItemValue.trim()) return;
    try {
      await saveNew(async () => addItem(newItemValue.trim()));
    } catch (error) {
      console.error('Failed to create card:', error);
    }
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
      className="flex h-full flex-col gap-4 bg-blue-600 p-4"
      style={{
        backgroundColor: '#0b73b9',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        padding: '16px',
      }}
    >
      <header className="flex flex-wrap items-center gap-2 text-white">
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Go back"
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white">
            {note?.name || 'Kanban Board'}
          </span>
          <span className="text-xs text-blue-100">Note board</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => navigate(`/notes/${noteId}`)}
            size="small"
            className="border-white text-white hover:border-white"
          >
            Checklist View
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            size="small"
            className="bg-white text-blue-600 hover:bg-blue-50"
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
            />
          ))}
        </Box>
      </DndContext>

      {isAddDialogOpen && (
        <AddCheckItemDialog
          isOpen={isAddDialogOpen}
          value={newItemValue}
          onChange={changeNewItemValue}
          onSave={handleCreateCard}
          onClose={closeAddDialog}
        />
      )}
    </main>
  );
};
