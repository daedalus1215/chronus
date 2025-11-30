import { useState } from 'react';
import {
  convertTextToSpeech,
  downloadAudio,
} from '../../../../api/requests/audio.requests';

export const useAudioActions = (assetId: number) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextToSpeech = async () => {
    try {
      setIsConverting(true);
      setError(null);
      await convertTextToSpeech(assetId);
    } catch (err) {
      setError('Failed to convert text to speech');
      console.error('Error converting text to speech:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAudio = async () => {
    if (!assetId) {
      setError('No audio file available. Please convert text to speech first.');
      return;
    }

    try {
      setIsDownloading(true);
      setError(null);
      const blob = await downloadAudio(assetId);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-audio-${assetId}.wav`;
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
    isConverting,
    isDownloading,
    error,
    assetId,
  };
};
