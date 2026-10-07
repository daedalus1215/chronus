import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Note } from '../../api/responses';
import { CheckItem } from '../../api/responses';
import {
  useCheckItems,
  useCheckItemsQuery,
} from '../CheckListView/hooks/useCheckItems';
import { useCheckItemEditDialog } from '../CheckListView/hooks/useCheckItemEditDialog';
import { EditCheckItemDialog } from '../CheckListView/components/EditCheckItemDialog/EditCheckItemDialog';
import { useAddCheckItemDialog } from '../CheckListView/hooks/useAddCheckItemDialog';
import { AddCheckItemDialog } from '../CheckListView/components/AddCheckItemDialog/AddCheckItemDialog';
import { useDeleteCheckItemDialog } from '../CheckListView/hooks/useDeleteCheckItemDialog';
import { DeleteCheckItemDialog } from '../CheckListView/components/DeleteCheckItemDialog/DeleteCheckItemDialog';
import { DraggableCheckItemList } from '../CheckListView/components/DraggableCheckItemList/DraggableCheckItemList';
import { DraggableCheckItem } from '../CheckListView/components/DraggableCheckItem/DraggableCheckItem';
import styles from './SidebarChecklistView.module.css';

type SidebarChecklistViewProps = {
  note: Note;
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'ready':
      return '#4f46e5';
    case 'in_progress':
      return '#facc15';
    case 'review':
      return '#fb923c';
    case 'done':
      return '#22c55e';
    default:
      return '#1a1a1a';
  }
};

export const SidebarChecklistView: React.FC<SidebarChecklistViewProps> = ({
  note,
}) => {
  const checkItemsQuery = useCheckItemsQuery(note.id);
  const checkItems: CheckItem[] = checkItemsQuery.data ?? [];
  const checkItemsError: Error | null | undefined = checkItemsQuery.error;
  const { addItem, toggleItem, deleteItem, updateItem, reorderItems } =
    useCheckItems(note);
  const {
    isOpen: isAddDialogOpen,
    value: newItemValue,
    openDialog: openAddDialog,
    closeDialog: closeAddDialog,
    changeValue: changeNewItemValue,
    saveNew,
  } = useAddCheckItemDialog();
  const {
    isOpen: isEditDialogOpen,
    editItemValue,
    openDialog: openEditDialog,
    closeDialog: closeEditDialog,
    changeValue: changeEditValue,
    saveEdit,
  } = useCheckItemEditDialog();
  const {
    isOpen: isDeleteDialogOpen,
    isDeleting,
    error: deleteError,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
    confirmDelete,
  } = useDeleteCheckItemDialog();
  const handleAdd = async (): Promise<void> => {
    try {
      await addItem(newItemValue.trim());
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };
  const handleToggle = async (id: number): Promise<void> => {
    try {
      await toggleItem(id, note);
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };
  const handleDeleteClick = (id: number): void => {
    openDeleteDialog(id);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await confirmDelete(deleteItem);
    } catch (err) {
      console.error('Failed to delete check item:', err);
    }
  };
  const handleDeleteCancel = (): void => {
    closeDeleteDialog();
  };
  const handleEdit = async (id: number, name: string): Promise<void> => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };
  const handleSaveEdit = async (): Promise<void> => {
    try {
      await saveEdit(handleEdit);
    } catch (err) {
      console.error('Failed to save edited item:', err);
    }
  };
  const handleCreateCheckItem = async (): Promise<void> => {
    try {
      await saveNew(handleAdd);
    } catch (err) {
      console.error('Failed to create check item:', err);
    }
  };
  const handleReorder = async (checkItemIds: number[]): Promise<void> => {
    try {
      await reorderItems(checkItemIds);
    } catch (err) {
      console.error('Failed to reorder check items:', err);
    }
  };
  return (
    <div className={styles.sidebarChecklist}>
      <div className="flex items-center justify-between border-b border-[var(--color-overlay-stronger)] px-3 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Add checklist item"
          onClick={openAddDialog}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {checkItemsError && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertDescription>{checkItemsError.message}</AlertDescription>
        </Alert>
      )}
      {isAddDialogOpen && (
        <AddCheckItemDialog
          isOpen={isAddDialogOpen}
          value={newItemValue}
          onChange={changeNewItemValue}
          onSave={handleCreateCheckItem}
          onClose={closeAddDialog}
        />
      )}
      {isEditDialogOpen && (
        <EditCheckItemDialog
          isOpen={isEditDialogOpen}
          value={editItemValue}
          onChange={changeEditValue}
          onSave={handleSaveEdit}
          onClose={closeEditDialog}
        />
      )}
      <ul className={`${styles.list} min-h-0 flex-1 list-none overflow-y-auto p-0`}>
        <DraggableCheckItemList
          checkItems={checkItems}
          onReorder={handleReorder}
          renderItem={(item, _index, registerFlipNode) => (
            <DraggableCheckItem
              key={item.id}
              onFlipNode={registerFlipNode}
              item={item}
              className={styles.listItem}
              style={{
                background: item.doneDate
                  ? 'var(--color-primary-light)'
                  : 'transparent',
              }}
              dragHandle={
                <button
                  type="button"
                  aria-label="drag to reorder"
                  className="-ml-1 cursor-grab p-2 text-muted-foreground active:cursor-grabbing"
                >
                  <GripVertical className="size-4" />
                </button>
              }
            >
              <div className="ml-1 flex flex-1 items-center pr-12">
                <span
                  className="mr-2 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                  aria-label={`Status: ${item.status || 'ready'}`}
                />
                <Checkbox
                  checked={!!item.doneDate}
                  onCheckedChange={() => handleToggle(item.id)}
                  onClick={e => e.stopPropagation()}
                />
                <div
                  className="ml-2 flex-1 cursor-pointer bg-transparent py-1"
                  role="button"
                  tabIndex={0}
                  aria-label="Edit check item"
                  onClick={e => {
                    e.stopPropagation();
                    openEditDialog(item.id, item.name);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditDialog(item.id, item.name);
                    }
                  }}
                >
                  <span
                    className="block whitespace-pre-wrap break-words"
                    style={{
                      textDecoration: item.doneDate ? 'line-through' : undefined,
                      color: item.doneDate
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text)',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="delete"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(item.id);
                }}
                className="absolute right-0 top-1/2 mx-2 -translate-y-1/2 p-2 text-destructive"
              >
                <Trash2 className="size-5" />
              </button>
            </DraggableCheckItem>
          )}
        />
      </ul>
      <DeleteCheckItemDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
