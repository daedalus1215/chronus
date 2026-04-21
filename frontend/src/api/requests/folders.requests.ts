import api from '../axios.interceptor';
import { FolderDto } from '../dtos/folder.dtos';

export const fetchFolders = async (): Promise<FolderDto[]> => {
  const res = await api.get('/folders');
  return res.data;
};

export const createFolder = async (data: {
  name: string;
  parentId?: number | null;
}): Promise<FolderDto> => {
  const res = await api.post('/folders', data);
  return res.data;
};

export const updateFolder = async (
  id: number,
  data: { name?: string; parentId?: number | null }
): Promise<FolderDto> => {
  const res = await api.patch(`/folders/${id}`, data);
  return res.data;
};

export const deleteFolder = async (id: number): Promise<void> => {
  await api.delete(`/folders/${id}`);
};
