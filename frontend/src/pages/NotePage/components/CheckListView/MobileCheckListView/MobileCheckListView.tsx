import React from 'react';
import { useCheckItems } from '../hooks/useCheckItems';
import { Note } from '../../../api/responses';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCheckItemsQuery } from '../hooks/useCheckItems';
import styles from './MobileCheckListView.module.css';
import { useCheckItemEditDialog } from '../hooks/useCheckItemEditDialog';
import { EditCheckItemDialog } from '../components/EditCheckItemDialog/EditCheckItemDialog';
import { useAddCheckItemDialog } from '../hooks/useAddCheckItemDialog';
import { AddCheckItemDialog } from '../components/AddCheckItemDialog/AddCheckItemDialog';
import { useDeleteCheckItemDialog } from '../hooks/useDeleteCheckItemDialog';
import { DeleteCheckItemDialog } from '../components/DeleteCheckItemDialog/DeleteCheckItemDialog';
import { DraggableCheckItemList } from '../components/DraggableCheckItemList/DraggableCheckItemList';
import { DraggableCheckItem } from '../components/DraggableCheckItem/DraggableCheckItem';
import { useCheckItemFilters } from '../hooks/useCheckItemFilters';
import { CheckItemFilterBar } from '../components/CheckItemFilterBar/CheckItemFilterBar';

type CheckListViewProps = {
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

export const MobileCheckListView: React.FC<CheckListViewProps> = ({ note }) => {
  const { data: checkItems = [], error } = useCheckItemsQuery(note.id);
  const {
    addItem,
    toggleItem,
    deleteItem,
    updateItem,
    reorderItems,
    isAdding,
    addError,
  } = useCheckItems(note);
  const {
    filters,
    setSearchText,
    setStatusFilter,
    clearSearch,
    clearFilters,
    filteredItems,
    matchCount,
    totalCount,
    hasActiveFilters,
  } = useCheckItemFilters(checkItems);
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

  const handleAdd = async () => {
    try {
      await addItem(newItemValue.trim());
    } catch (err) {
      // You might want to show an error toast here
      console.error('Failed to add item:', err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleItem(id, note);
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    openDeleteDialog(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await confirmDelete(deleteItem);
    } catch (err) {
      console.error('Failed to delete check item:', err);
    }
  };

  const handleDeleteCancel = () => {
    closeDeleteDialog();
  };

  const handleEdit = async (id: number, name: string) => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };
  const handleSaveEdit = async () => {
    try {
      await saveEdit(handleEdit);
    } catch (err) {
      console.error('Failed to save edited item:', err);
    }
  };

  const handleCreateNote = async () => {
    try {
      await saveNew(handleAdd);
    } catch (err) {
      console.error('Failed to create check item:', err);
    }
  };

  const showAddFromSearch =
    filters.statusFilter === 'all' &&
    filters.searchText.trim().length > 0 &&
    filteredItems.length === 0;

  const handleAddFromSearch = async () => {
    const name = filters.searchText.trim();
    if (!name || isAdding) return;
    try {
      await addItem(name);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleReorder = async (checkItemIds: number[]) => {
    try {
      await reorderItems(checkItemIds);
    } catch (err) {
      console.error('Failed to reorder check items:', err);
    }
  };

  return (
    <div>
      <div className={`${styles.container} mt-4 p-4`}>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <CheckItemFilterBar
          filters={filters}
          setSearchText={setSearchText}
          setStatusFilter={setStatusFilter}
          clearSearch={clearSearch}
          clearFilters={clearFilters}
          matchCount={matchCount}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          compact={true}
        />

        {isAddDialogOpen && (
          <AddCheckItemDialog
            isOpen={isAddDialogOpen}
            value={newItemValue}
            onChange={changeNewItemValue}
            onSave={handleCreateNote}
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

        {hasActiveFilters && filteredItems.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-muted-foreground">
              No items match the current filters.
            </span>
            {showAddFromSearch && (
              <>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={handleAddFromSearch}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Add "{filters.searchText.trim()}" item
                  </Button>
                </div>
                {addError && (
                  <Alert variant="destructive" className="mt-4 text-left">
                    <AlertDescription>{addError}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {!hasActiveFilters || filteredItems.length > 0 ? (
          <ul className="list-none p-0">
            <DraggableCheckItemList
              checkItems={filteredItems}
              onReorder={handleReorder}
              renderItem={(item, _index, registerFlipNode) => (
                <DraggableCheckItem
                  key={item.id}
                  onFlipNode={registerFlipNode}
                  item={item}
                  style={{
                    background: item.doneDate
                      ? 'var(--color-primary-light)'
                      : 'transparent',
                  }}
                  dragHandle={
                    <button
                      type="button"
                      aria-label="drag to reorder"
                      className="-ml-1 p-2 text-muted-foreground"
                      style={{ touchAction: 'none' }}
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
        ) : null}
      </div>
      <DeleteCheckItemDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <Button
        size="icon"
        aria-label="Create new note"
        onClick={openAddDialog}
        className="fixed bottom-8 right-8 rounded-full"
      >
        <Plus />
      </Button>
    </div>
  );
};
