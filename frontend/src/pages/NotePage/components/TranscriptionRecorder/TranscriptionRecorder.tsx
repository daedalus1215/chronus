import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useTranscriptionWebSocket } from '../../hooks/useTranscriptionWebSocket/useTranscriptionWebSocket';
import { useAudioRecorder } from '../../hooks/useAudioRecorder/useAudioRecorder';

type TranscriptionRecorderController = {
  toggleRecording: () => Promise<void> | void;
  isRecording: boolean;
  isInitializing: boolean;
  micAvailable: boolean | null;
  getStatusText: () => string;
};

type TranscriptionRecorderProps = {
  noteId: number;
  onTranscription: (text: string) => void;
  useOwnFab?: boolean;
  onControllerReady?: (controller: TranscriptionRecorderController) => void;
};

export const TranscriptionRecorder: React.FC<TranscriptionRecorderProps> = ({
  noteId,
  onTranscription,
  useOwnFab = true,
  onControllerReady,
}) => {
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    isConnected,
    isRecording: isWsRecording,
    error: wsError,
    startRecording: startWs,
    stopRecording: stopWs,
    sendAudioChunk,
  } = useTranscriptionWebSocket({
    noteId,
    onTranscription,
    // Don't attempt a gateway connection when we already know there is no mic.
    enabled: micAvailable !== false,
  });

  const {
    isRecording: isAudioRecording,
    error: audioError,
    startRecording: startAudio,
    stopRecording: stopAudio,
    checkMicrophoneAvailability,
  } = useAudioRecorder({
    onAudioChunk: sendAudioChunk,
    enabled: true, // Audio processor checks isRecording state internally
  });

  const isRecording = isWsRecording && isAudioRecording;
  const error = wsError || audioError;

  useEffect(() => {
    const checkMic = async () => {
      const result = await checkMicrophoneAvailability();
      setMicAvailable(result.available);
      if (!result.available) {
        toast.warning(result.error ?? 'Microphone not available');
      }
    };
    checkMic();
  }, [checkMicrophoneAvailability]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      stopAudio();
      stopWs();
      setIsInitializing(false);
    } else {
      // Start recording: wait for WebSocket to open, then start mic
      try {
        setIsInitializing(true);
        const availability = await checkMicrophoneAvailability();
        setMicAvailable(availability.available);

        if (!availability.available) {
          toast.warning(availability.error ?? 'Microphone not available');
          return;
        }

        console.log('Connecting WebSocket...');
        await startWs();

        console.log('Starting audio recording...');
        await startAudio();
      } catch (err) {
        console.error('Failed to start recording:', err);
      } finally {
        setIsInitializing(false);
      }
    }
  }, [
    checkMicrophoneAvailability,
    isRecording,
    startAudio,
    startWs,
    stopAudio,
    stopWs,
  ]);

  const getStatusText = useCallback(() => {
    if (error) return `Error: ${error}`;
    if (isRecording) return 'Recording - Click to stop';
    if (isInitializing) return 'Initializing...';
    if (micAvailable === false) return 'Microphone not available';
    if (isConnected) return 'Ready to record';
    return 'Idle - Click to start recording';
  }, [error, isConnected, isInitializing, isRecording, micAvailable]);

  useEffect(() => {
    if (!onControllerReady) {
      return;
    }

    onControllerReady({
      toggleRecording: handleToggleRecording,
      isRecording,
      isInitializing,
      micAvailable,
      getStatusText,
    });
  }, [
    getStatusText,
    handleToggleRecording,
    isInitializing,
    isRecording,
    micAvailable,
    onControllerReady,
  ]);

  if (!useOwnFab) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={handleToggleRecording}
          disabled={micAvailable === false || isInitializing}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className="fixed bottom-6 right-6 z-[1000] rounded-full"
        >
          <span className="relative inline-flex">
            {isInitializing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : isRecording ? (
              <Square className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
            {isRecording && (
              <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-white" />
            )}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{getStatusText()}</TooltipContent>
    </Tooltip>
  );
};
