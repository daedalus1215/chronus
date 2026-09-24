import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../../api/axios.interceptor';
import { CheckItem, Note } from '../../../api/responses';
import { orderCheckItemsForDisplay } from '../orderCheckItems';

export const checkItemKeys = {
  all: ['checkItems'] as const,
  lists: () => [...checkItemKeys.all, 'list'] as const,
  list: (noteId: number) => [...checkItemKeys.lists(), noteId] as const,
  details: () => [...checkItemKeys.all, 'detail'] as const,
  detail: (id: number) => [...checkItemKeys.details(), id] as const,
};

// Add a query hook for fetching check items
export const useCheckItemsQuery = (noteId: number) => {
  return useQuery({
    queryKey: checkItemKeys.list(noteId),
    queryFn: async () => {
      const response = await api.get<CheckItem[]>(
        `/check-items/notes/${noteId}`
      );
      return orderCheckItemsForDisplay(response.data);
    },
    enabled: !!noteId,
  });
};

type UseCheckListReturn = {
  noteState: Note;
  setNoteState: (note: Note) => void;
  error: string | null;
  addItem: (name: string) => Promise<void>;
  toggleItem: (id: number, note: Note) => Promise<CheckItem>;
  deleteItem: (id: number) => Promise<void>;
  updateItem: (
    id: number,
    name: string,
    description?: string
  ) => Promise<CheckItem>;
  reorderItems: (checkItemIds: number[]) => Promise<CheckItem[]>;
  isAdding: boolean;
  isToggling: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isReordering: boolean;
  addError: string | null;
  toggleError: string | null;
  deleteError: string | null;
  updateError: string | null;
  reorderError: string | null;
};

export const useCheckItems = (note: Note): UseCheckListReturn => {
  const queryClient = useQueryClient();

  const { data: checkItems = [] } = useCheckItemsQuery(note.id);
  const noteState = { ...note, checkItems };

  const orderRefreshTimer = useRef<number | null>(null);

  const clearOrderRefresh = useCallback(() => {
    if (orderRefreshTimer.current !== null) {
      window.clearTimeout(orderRefreshTimer.current);
    }
  }, []);

  // Re-derive the display order from cached state so items settle into
  // their canonical slots (unchecked first, most recently completed on
  // top) after a local mutation.
  const applyDisplayOrder = useCallback(() => {
    queryClient.setQueryData<CheckItem[]>(
      checkItemKeys.list(note.id),
      (oldItems: CheckItem[] | undefined) =>
        oldItems ? orderCheckItemsForDisplay(oldItems) : oldItems
    );
    queryClient.setQueryData<Note>(
      ['note', note.id],
      (oldNote: Note | undefined) =>
        oldNote?.checkItems
          ? {
              ...oldNote,
              checkItems: orderCheckItemsForDisplay(oldNote.checkItems),
            }
          : oldNote
    );
  }, [queryClient, note.id]);

  // Small delay so a toggle registers in place before the list settles
  // into its new order; rapid toggles share one settle.
  const scheduleDisplayOrder = useCallback(() => {
    clearOrderRefresh();
    orderRefreshTimer.current = window.setTimeout(() => {
      orderRefreshTimer.current = null;
      applyDisplayOrder();
    }, 200);
  }, [clearOrderRefresh, applyDisplayOrder]);

  useEffect(() => clearOrderRefresh, [clearOrderRefresh]);

  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post<CheckItem[]>(
        `/check-items/notes/${note.id}`,
        { name }
      );
      return response.data;
    },
    onSuccess: checkItems => {
      const orderedCheckItems = orderCheckItemsForDisplay(checkItems);
      queryClient.setQueryData(
        ['note', note.id],
        (oldData: Note | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, checkItems: orderedCheckItems };
        }
      );
      queryClient.setQueryData(checkItemKeys.list(note.id), orderedCheckItems);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await api.patch<CheckItem>(
        `/check-items/items/${id}/toggle/notes/${note.id}`
      );
      return response.data;
    },
    onMutate: async ({ id }: { id: number }) => {
      // Cancel any outgoing refetches to avoid overwriting the optimistic update
      await queryClient.cancelQueries({
        queryKey: checkItemKeys.list(note.id),
      });
      await queryClient.cancelQueries({ queryKey: ['note', note.id] });

      // Snapshot the previous values for rollback
      const previousCheckItems = queryClient.getQueryData<CheckItem[]>(
        checkItemKeys.list(note.id)
      );
      const previousNote = queryClient.getQueryData<Note>(['note', note.id]);

      // Flip the item in place -- no movement yet; the list settles
      // into its new order shortly after.
      const predictToggle = (item: CheckItem): CheckItem =>
        item.doneDate
          ? { ...item, doneDate: null, status: 'ready' }
          : { ...item, doneDate: new Date().toISOString(), status: 'done' };

      if (previousCheckItems) {
        queryClient.setQueryData(
          checkItemKeys.list(note.id),
          previousCheckItems.map(item =>
            item.id === id ? predictToggle(item) : item
          )
        );
      }
      if (previousNote) {
        queryClient.setQueryData(
          ['note', note.id],
          previousNote.checkItems
            ? {
                ...previousNote,
                checkItems: previousNote.checkItems.map(item =>
                  item.id === id ? predictToggle(item) : item
                ),
              }
            : previousNote
        );
      }

      return { previousCheckItems, previousNote };
    },
    onSuccess: (updatedItem, { id }) => {
      queryClient.setQueryData(
        checkItemKeys.list(note.id),
        (oldItems: CheckItem[] | undefined) => {
          if (!oldItems) return oldItems;
          return oldItems.map(item => (item.id === id ? updatedItem : item));
        }
      );
      queryClient.setQueryData(
        ['note', note.id],
        (oldNote: Note | undefined) => {
          if (!oldNote?.checkItems) return oldNote;
          return {
            ...oldNote,
            checkItems: oldNote.checkItems.map(item =>
              item.id === id ? updatedItem : item
            ),
          };
        }
      );
      scheduleDisplayOrder();
    },
    onError: (_error, _variables, context) => {
      clearOrderRefresh();
      if (context?.previousCheckItems) {
        queryClient.setQueryData(
          checkItemKeys.list(note.id),
          context.previousCheckItems
        );
      }
      if (context?.previousNote) {
        queryClient.setQueryData(['note', note.id], context.previousNote);
      }
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/check-items/items/${id}/notes/${note.id}`);
      return id;
    },
    onSuccess: deletedId => {
      queryClient.setQueryData(
        ['note', note.id],
        (oldData: Note | undefined) => {
          if (!oldData?.checkItems) return oldData;
          return {
            ...oldData,
            checkItems: oldData.checkItems.filter(
              item => item.id !== deletedId
            ),
          };
        }
      );
      queryClient.setQueryData(
        checkItemKeys.list(note.id),
        (oldItems: CheckItem[] | undefined) => {
          if (!oldItems) return oldItems;
          return oldItems.filter(item => item.id !== deletedId);
        }
      );
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: number;
      name: string;
      description?: string;
    }) => {
      const response = await api.patch<CheckItem>(
        `/check-items/items/${id}/notes/${note.id}`,
        { name, description }
      );
      return response.data;
    },
    onSuccess: (updatedItem, { id }) => {
      queryClient.setQueryData(
        ['note', note.id],
        (oldData: Note | undefined) => {
          if (!oldData?.checkItems) return oldData;
          return {
            ...oldData,
            checkItems: oldData.checkItems.map(item =>
              item.id === id ? updatedItem : item
            ),
          };
        }
      );
      queryClient.setQueryData(
        checkItemKeys.list(note.id),
        (oldItems: CheckItem[] | undefined) => {
          if (!oldItems) return oldItems;
          return oldItems.map(item => (item.id === id ? updatedItem : item));
        }
      );
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async (checkItemIds: number[]) => {
      const response = await api.put<CheckItem[]>(
        `/check-items/notes/${note.id}/reorder`,
        { checkItemIds }
      );
      return response.data;
    },
    onMutate: async (checkItemIds: number[]) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: checkItemKeys.list(note.id),
      });
      await queryClient.cancelQueries({ queryKey: ['note', note.id] });

      // Snapshot the previous values
      const previousCheckItems = queryClient.getQueryData<CheckItem[]>(
        checkItemKeys.list(note.id)
      );
      const previousNote = queryClient.getQueryData<Note>(['note', note.id]);

      // Optimistically update the check items order
      if (previousCheckItems) {
        const reorderedItems = checkItemIds
          .map(id => previousCheckItems.find(item => item.id === id))
          .filter((item): item is CheckItem => item !== undefined);

        queryClient.setQueryData(checkItemKeys.list(note.id), reorderedItems);
      }

      if (previousNote) {
        const reorderedItems = checkItemIds
          .map(id => previousNote.checkItems?.find(item => item.id === id))
          .filter((item): item is CheckItem => item !== undefined);

        queryClient.setQueryData(['note', note.id], {
          ...previousNote,
          checkItems: reorderedItems,
        });
      }

      // Return context with snapshot values for rollback
      return { previousCheckItems, previousNote };
    },
    onError: (_err, _checkItemIds, context) => {
      // Rollback to previous state on error
      if (context?.previousCheckItems) {
        queryClient.setQueryData(
          checkItemKeys.list(note.id),
          context.previousCheckItems
        );
      }
      if (context?.previousNote) {
        queryClient.setQueryData(['note', note.id], context.previousNote);
      }
    },
    onSuccess: checkItems => {
      const orderedCheckItems = orderCheckItemsForDisplay(checkItems);
      queryClient.setQueryData(
        ['note', note.id],
        (oldData: Note | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, checkItems: orderedCheckItems };
        }
      );
      queryClient.setQueryData(checkItemKeys.list(note.id), orderedCheckItems);
    },
  });

  const addItem = async (name: string): Promise<void> => {
    addItemMutation.mutateAsync(name);
  };

  const toggleItem = async (id: number) => {
    return toggleItemMutation.mutateAsync({ id });
  };

  const deleteItem = async (id: number) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const updateItem = async (id: number, name: string, description?: string) => {
    return updateItemMutation.mutateAsync({ id, name, description });
  };

  const reorderItems = async (checkItemIds: number[]) => {
    return reorderItemsMutation.mutateAsync(checkItemIds);
  };

  const setNoteState = (updatedNote: Note) => {
    queryClient.setQueryData(['note', note.id], updatedNote);
  };

  return {
    noteState,
    setNoteState,
    error: null,
    addItem,
    toggleItem,
    deleteItem,
    updateItem,
    reorderItems,
    isAdding: addItemMutation.isPending,
    isToggling: toggleItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isReordering: reorderItemsMutation.isPending,
    addError: addItemMutation.error?.message || null,
    toggleError: toggleItemMutation.error?.message || null,
    deleteError: deleteItemMutation.error?.message || null,
    updateError: updateItemMutation.error?.message || null,
    reorderError: reorderItemsMutation.error?.message || null,
  };
};
