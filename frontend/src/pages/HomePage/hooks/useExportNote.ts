import { useMutation } from '@tanstack/react-query';
import { exportNote as exportNoteRequest } from '../../../api/requests/notes.requests';

export const useExportNote = () => {
  const exportNoteMutation = useMutation({
    mutationFn: async (noteId: number): Promise<Blob> => {
      return await exportNoteRequest(noteId);
    },
  });

  const exportNote = async (noteId: number, noteName: string) => {
    const blob = await exportNoteMutation.mutateAsync(noteId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Sanitize filename (same logic as backend)
    const sanitizedName = noteName
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    link.download = `${sanitizedName || 'memo'}.chronus`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return {
    exportNote,
    isExporting: exportNoteMutation.isPending,
    error: exportNoteMutation.error?.message || null,
  };
};