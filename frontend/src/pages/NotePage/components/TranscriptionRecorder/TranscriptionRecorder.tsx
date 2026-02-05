import React, { useCallback, useEffect, useState } from 'react';
import {
  Fab,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Badge,
} from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning'>(
    'error'
  );

  // Log when onTranscription changes to verify it's being passed correctly
  useEffect(() => {
    const callbackStr = onTranscription?.toString() || '';
    const isEmpty =
      callbackStr.includes(
        'appendToDescription called but appendToDescriptionFn is not set yet'
      ) ||
      callbackStr.trim() === '() => {\n          }' ||
      callbackStr.trim() === '() => {}';

    console.log('🎤 TranscriptionRecorder: onTranscription callback updated', {
      isFunction: typeof onTranscription === 'function',
      isNull: onTranscription === null,
      isUndefined: onTranscription === undefined,
      isEmpty,
      callbackPreview: callbackStr.substring(0, 150),
    });

    if (!isEmpty && typeof onTranscription === 'function') {
      console.log('✅ TranscriptionRecorder: Got real callback!');
    } else {
      console.warn(
        '⚠️ TranscriptionRecorder: Still using empty function fallback'
      );
    }
  }, [onTranscription]);

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
    enabled: false, // We control connection manually
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
        setSnackbarMessage('Microphone not available');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }
    };
    checkMic();
  }, [checkMicrophoneAvailability]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      stopAudio();
      stopWs();
      setIsInitializing(false);
    } else {
      // Start recording
      try {
        setIsInitializing(true);

        // First connect WebSocket if not connected
        // Use startWs which handles connection and sets isRecording
        // Don't check isConnected state as it may not have updated yet
        console.log('Starting WebSocket connection...');
        startWs();
        // Wait a bit for connection to establish and gateway to send 'connected' event
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Then start audio recording
        console.log('Starting audio recording...');
        await startAudio();
        setIsInitializing(false);
      } catch (err) {
        setIsInitializing(false);
        console.error('Failed to start recording:', err);
      }
    }
  }, [isRecording, startAudio, startWs, stopAudio, stopWs]);

  const getStatusText = useCallback(() => {
    if (error) return `Error: ${error}`;
    if (isRecording) return 'Recording - Click to stop';
    if (isInitializing) return 'Initializing...';
    if (micAvailable === false) return 'Microphone not available';
    if (isConnected) return 'Ready to record';
    return 'Idle - Click to start recording';
  }, [error, isConnected, isInitializing, isRecording, micAvailable]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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

  return (
    <>
      {useOwnFab && (
        <Tooltip title={getStatusText()} arrow placement="left">
          <Fab
            color={isRecording ? 'error' : 'primary'}
            onClick={handleToggleRecording}
            disabled={micAvailable === false || isInitializing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <Badge
              badgeContent=" "
              color="error"
              invisible={!isRecording}
              sx={{
                '& .MuiBadge-badge': {
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
              }}
            >
              {isInitializing ? (
                <CircularProgress size={24} color="inherit" />
              ) : isRecording ? (
                <Stop />
              ) : (
                <Mic />
              )}
            </Badge>
          </Fab>
        </Tooltip>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
