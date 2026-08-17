import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNoteVersions, loadNoteVersion, NoteVersion } from '../../api/versions.requests';
import { noteKeys } from '../useNote/useNoteQueries';

const MAX_VERSIONS = 20;

export const useNoteVersions = (noteId: number) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['noteVersions', noteId],
    queryFn: () => fetchNoteVersions(noteId),
    enabled: false, // Lazy — fetched on demand when tab is shown
    staleTime: 0,
  });

  const loadVersionMutation = useMutation({
    mutationFn: (vid: number) => loadNoteVersion(noteId, vid),
    onSuccess: () => {
      // Invalidate both the version list (new entry created) and the note detail
      queryClient.invalidateQueries({ queryKey: ['noteVersions', noteId] });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) });
    },
  });

  return {
    versions: data?.versions ?? [],
    total: data?.total ?? 0,
    maxVersions: MAX_VERSIONS,
    isLoading,
    error,
    refetch,
    loadVersion: loadVersionMutation.mutateAsync,
    isLoadingVersion: loadVersionMutation.isPending,
  };
};

export type { NoteVersion };
