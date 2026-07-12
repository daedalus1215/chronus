import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNoteAudios,
  deleteAudio,
  downloadAudio,
  convertTextToSpeech,
} from '../../../../api/requests/audio.requests';

const queryKey = (noteId: number) => ['noteAudios', noteId];

/**
 * Lazy-loaded React Query hook for fetching, generating, downloading,
 * and deleting audio files associated with a note.
 */
export const useNoteAudios = (noteId: number) => {
  const queryClient = useQueryClient();

  // Query — lazy loaded (enabled only when explicitly triggered)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKey(noteId),
    queryFn: () => getNoteAudios(noteId),
    enabled: false,
    staleTime: 10_000,
  });

  // Mutation — generate new audio via text-to-speech
  const generateMutation = useMutation({
    mutationFn: () => convertTextToSpeech(noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKey(noteId) });
    },
  });

  // Mutation — delete an audio file
  const deleteMutation = useMutation({
    mutationFn: (audioId: number) => deleteAudio(audioId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKey(noteId) });
    },
  });

  const [isDownloading, setIsDownloading] = useState(false);

  // Download — handled locally (blob → trigger browser download)
  const handleDownload = useCallback(
    async (audioId: number, fileName: string) => {
      try {
        setIsDownloading(true);
        const blob = await downloadAudio(audioId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Error downloading audio:', err);
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return {
    audios: data?.audios ?? [],
    isLoading,
    error,
    refetch,
    generateAudio: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    deleteAudio: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    downloadAudio: handleDownload,
    isDownloading,
  };
};
