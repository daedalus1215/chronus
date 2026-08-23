import { useQuery } from '@tanstack/react-query';
import { fetchFolders } from '../../api/requests/folders.requests';
import { FolderDto } from '../../api/dtos/folder.dtos';

/**
 * Shared folder list for the authenticated user (flat, backend-ordered).
 * Backed by one cache entry so Explorer and the memo sidebar stay in sync.
 */
export const useFolders = () => {
  return useQuery<FolderDto[]>({
    queryKey: ['folders'],
    queryFn: fetchFolders,
    staleTime: 5 * 60 * 1000,
  });
};
