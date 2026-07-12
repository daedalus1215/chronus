import api from '../../../api/axios.interceptor';

// Full check item as returned by the API.
type CheckItemResponse = {
  id: number;
  noteId: number;
  name: string;
  description?: string | null;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  order: number;
  doneDate?: string | null;
  archiveDate?: string | null;
};

// Only the fields the merge endpoint accepts (extra fields are rejected by the
// backend's whitelist validation, so we must strip id/noteId/timestamps here).
export type CheckItemForMerge = {
  name: string;
  description?: string | null;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  order: number;
  doneDate?: string | null;
  archiveDate?: string | null;
};

// Fetch check items for a single note (used when building merge data).
export const fetchNoteCheckItems = async (
  noteId: number
): Promise<CheckItemForMerge[]> => {
  const { data } = await api.get<CheckItemResponse[]>(
    `/check-items/notes/${noteId}`
  );
  return (data ?? []).map(item => ({
    name: item.name,
    description: item.description,
    status: item.status,
    order: item.order,
    doneDate: item.doneDate,
    archiveDate: item.archiveDate,
  }));
};
