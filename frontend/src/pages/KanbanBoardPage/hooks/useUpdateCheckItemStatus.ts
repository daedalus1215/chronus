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
    onSuccess: updatedItem => {
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
