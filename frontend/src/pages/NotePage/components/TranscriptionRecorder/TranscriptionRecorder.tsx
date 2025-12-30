import React, { useEffect, useState } from 'react';
import { IconButton, CircularProgress, Alert, Box, Chip } from '@mui/material';
import { Mic, Error as ErrorIcon } from '@mui/icons-material';
import { useTranscriptionWebSocket } from '../../hooks/useTranscriptionWebSocket/useTranscriptionWebSocket';
import { useAudioRecorder } from '../../hooks/useAudioRecorder/useAudioRecorder';

type TranscriptionRecorderProps = {
  noteId: number;
  onTranscription: (text: string) => void;
};

export const TranscriptionRecorder: React.FC<TranscriptionRecorderProps> = ({
  noteId,
  onTranscription,
}) => {
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Log when onTranscription changes to verify it's being passed correctly
  useEffect(() => {
    const callbackStr = onTranscription?.toString() || '';
    const isEmpty = callbackStr.includes('appendToDescription called but appendToDescriptionFn is not set yet') ||
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
      console.warn('⚠️ TranscriptionRecorder: Still using empty function fallback');
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
    };
    checkMic();
  }, [checkMicrophoneAvailability]);

  const handleToggleRecording = async () => {
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Then start audio recording
        console.log('Starting audio recording...');
        await startAudio();
        setIsInitializing(false);
      } catch (err) {
        setIsInitializing(false);
        console.error('Failed to start recording:', err);
      }
    }
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (isRecording) return 'Recording';
    if (isInitializing) return 'Initializing...';
    if (isConnected) return 'Ready';
    return 'Idle';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <IconButton
        onClick={handleToggleRecording}
        disabled={micAvailable === false || isInitializing}
        color={isRecording ? 'error' : 'primary'}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        sx={{
          backgroundColor: isRecording ? 'error.light' : 'transparent',
          '&:hover': {
            backgroundColor: isRecording ? 'error.dark' : 'action.hover',
          },
        }}
      >
        {isInitializing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <Mic />
        )}
      </IconButton>

      <Chip
        icon={error ? <ErrorIcon /> : undefined}
        label={getStatusText()}
        color={error ? 'error' : isRecording ? 'success' : 'default'}
        size="small"
        variant="outlined"
      />

      {error && (
        <Alert severity="error" sx={{ flex: 1, py: 0 }}>
          {error}
        </Alert>
      )}

      {micAvailable === false && !error && (
        <Alert severity="warning" sx={{ flex: 1, py: 0 }}>
          Microphone not available
        </Alert>
      )}
    </Box>
  );
};

