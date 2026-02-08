import { useState, useCallback } from 'react';
import {
  convertTextToSpeech,
  downloadAudio,
  getNoteAudios,
  NoteAudio,
} from '../../../../api/requests/audio.requests';

export const useAudioActions = (noteId: number) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioHistory, setAudioHistory] = useState<NoteAudio[]>([]);

  const fetchAudioHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      setError(null);
      const response = await getNoteAudios(noteId);
      setAudioHistory(response.audios);
    } catch (err) {
      setError('Failed to fetch audio history');
      console.error('Error fetching audio history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [noteId]);

  const handleTextToSpeech = async () => {
    try {
      setIsConverting(true);
      setError(null);
      await convertTextToSpeech(noteId);
      // Refresh audio history after successful conversion
      await fetchAudioHistory();
    } catch (err) {
      setError('Failed to convert text to speech');
      console.error('Error converting text to speech:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAudio = async (audioId: number, fileName: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      const blob = await downloadAudio(audioId);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download audio');
      console.error('Error downloading audio:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    handleTextToSpeech,
    handleDownloadAudio,
    fetchAudioHistory,
    audioHistory,
    isConverting,
    isDownloading,
    isHistoryLoading,
    error,
    noteId,
  };
};
