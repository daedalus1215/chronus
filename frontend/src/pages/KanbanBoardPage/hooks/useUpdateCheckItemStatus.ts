import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios.interceptor';
import { CheckItem } from '../../NotePage/api/responses';
import { checkItemKeys } from '../../NotePage/components/CheckListView/hooks/useCheckItems';

export type CheckItemStatus = 'ready' | 'in_progress' | 'review' | 'done';

type UpdateCheckItemStatusInput = {
  id: number;
  status: CheckItemStatus;
};

export const useUpdateCheckItemStatus = (noteId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateCheckItemStatusInput) => {
      const response = await api.patch<CheckItem>(
        `/check-items/items/${id}/status`,
        { status }
      );
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: checkItemKeys.list(noteId) });
      await queryClient.cancelQueries({ queryKey: ['note', noteId] });
      const previousItems = queryClient.getQueryData<CheckItem[]>(
        checkItemKeys.list(noteId)
      );
      const previousNote = queryClient.getQueryData<{ checkItems?: CheckItem[] }>(
        ['note', noteId]
      );
      const optimisticUpdate = (item: CheckItem): CheckItem =>
        item.id === id
          ? {
              ...item,
              status,
              doneDate: status === 'done' ? new Date().toISOString() : null,
            }
          : item;
      if (previousItems) {
        queryClient.setQueryData(
          checkItemKeys.list(noteId),
          previousItems.map(optimisticUpdate)
        );
      }
      if (previousNote?.checkItems) {
        queryClient.setQueryData(['note', noteId], {
          ...previousNote,
          checkItems: previousNote.checkItems.map(optimisticUpdate),
        });
      }
      return { previousItems, previousNote };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          checkItemKeys.list(noteId),
          context.previousItems
        );
      }
      if (context?.previousNote) {
        queryClient.setQueryData(['note', noteId], context.previousNote);
      }
    },
    onSuccess: updatedItem => {
      if (!updatedItem) return;
      queryClient.setQueryData(
        checkItemKeys.list(noteId),
        (oldItems: CheckItem[] | undefined) => {
          if (!oldItems) return oldItems;
          return oldItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          );
        }
      );
      queryClient.setQueryData(
        ['note', noteId],
        (oldNote: { checkItems?: CheckItem[] } | undefined) => {
          if (!oldNote?.checkItems) return oldNote;
          return {
            ...oldNote,
            checkItems: oldNote.checkItems.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          };
        }
      );
    },
  });
};
