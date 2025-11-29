import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../../api/axios.interceptor';
import { CheckItem, Note } from '../../../api/responses';

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
      const response = await api.get<CheckItem[]>(`/check-items/notes/${noteId}`);
      return response.data;
    },
    enabled: !!noteId,
  });
};

type UseCheckListReturn = {
    noteState: Note;
    setNoteState: (note: Note) => void;
    error: string | null;
    addItem: (name: string) => Promise<CheckItem[]>;
    toggleItem: (id: number, note: Note) => Promise<CheckItem>;
    deleteItem: (id: number) => Promise<void>;
    updateItem: (id: number, name: string) => Promise<CheckItem>;
    isAdding: boolean;
    isToggling: boolean;
    isDeleting: boolean;
    isUpdating: boolean;
    addError: string | null;
    toggleError: string | null;
    deleteError: string | null;
    updateError: string | null;
}

export const useCheckItems = (note: Note): UseCheckListReturn => {
  const queryClient = useQueryClient();

  const { data: checkItems = [] } = useCheckItemsQuery(note.id);
  const noteState = { ...note, checkItems };

  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post<CheckItem[]>(`/check-items/notes/${note.id}`, { name });
      return response.data;
    },
    onSuccess: (checkItems) => {
      queryClient.setQueryData(['note', note.id], (oldData: Note | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, checkItems };
      });
      queryClient.setQueryData(checkItemKeys.list(note.id), checkItems);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await api.patch<CheckItem>(`/check-items/items/${id}/toggle/notes/${note.id}`);
      return response.data;
    },
    onSuccess: (updatedItem, { id }) => {
      queryClient.setQueryData(['note', note.id], (oldCheckItems: CheckItem[] | undefined) => {
        if (!oldCheckItems) return oldCheckItems;
        return {
          ...oldCheckItems,
          checkItems: oldCheckItems.map(item => 
            item.id === id ? updatedItem : item
          )
        };
      });
      queryClient.setQueryData(checkItemKeys.list(note.id), (oldItems: CheckItem[] | undefined) => {
        if (!oldItems) return oldItems;
        return oldItems.map(item => item.id === id ? updatedItem : item);
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/check-items/items/${id}/notes/${note.id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['note', note.id], (oldData: Note | undefined) => {
        if (!oldData?.checkItems) return oldData;
        return {
          ...oldData,
          checkItems: oldData.checkItems.filter(item => item.id !== deletedId)
        };
      });
      queryClient.setQueryData(checkItemKeys.list(note.id), (oldItems: CheckItem[] | undefined) => {
        if (!oldItems) return oldItems;
        return oldItems.filter(item => item.id !== deletedId);
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await api.patch<CheckItem>(`/check-items/items/${id}/notes/${note.id}`, { name });
      return response.data;
    },
    onSuccess: (updatedItem, { id }) => {
      queryClient.setQueryData(['note', note.id], (oldData: Note | undefined) => {
        if (!oldData?.checkItems) return oldData;
        return {
          ...oldData,
          checkItems: oldData.checkItems.map(item => 
            item.id === id ? updatedItem : item
          )
        };
      }); 
      queryClient.setQueryData(checkItemKeys.list(note.id), (oldItems: CheckItem[] | undefined) => {
        if (!oldItems) return oldItems;
        return oldItems.map(item => item.id === id ? updatedItem : item);
      });
    },
  });

  const addItem = async (name: string) => {
    return addItemMutation.mutateAsync(name);
  };

  const toggleItem = async (id: number) => {
    return toggleItemMutation.mutateAsync({ id });
  };

  const deleteItem = async (id: number) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const updateItem = async (id: number, name: string) => {
    return updateItemMutation.mutateAsync({ id, name });
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
    isAdding: addItemMutation.isPending,
    isToggling: toggleItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    addError: addItemMutation.error?.message || null,
    toggleError: toggleItemMutation.error?.message || null,
    deleteError: deleteItemMutation.error?.message || null,
    updateError: updateItemMutation.error?.message || null,
  };
}; 