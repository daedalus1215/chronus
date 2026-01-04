import { useState, useRef, useCallback, useEffect } from 'react';
import { env } from '../../../../../vite.env.config';

type UseTranscriptionWebSocketProps = {
  noteId: number; // Kept for future use, but not needed for direct thoth connection
  onTranscription: (text: string) => void;
  enabled: boolean; // Intentionally unused - connection is controlled manually
};

type UseTranscriptionWebSocketReturn = {
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  sendAudioChunk: (chunk: ArrayBuffer) => void;
};

export const useTranscriptionWebSocket = ({
  noteId, // Not needed for direct thoth connection
  onTranscription,
  enabled, // Intentionally unused - connection is controlled manually
}: UseTranscriptionWebSocketProps): UseTranscriptionWebSocketReturn => {
  // Suppress unused parameter warnings - these are part of the API but not used internally
  void noteId;
  void enabled;
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Use ref for immediate state access in callbacks
  const onTranscriptionRef = useRef(onTranscription); // Store latest callback in ref

  // Keep ref updated with latest callback - ALWAYS update it, even if it looks the same
  useEffect(() => {
    const prevCallback = onTranscriptionRef.current
      ?.toString()
      .substring(0, 200);
    const prevIsEmpty =
      prevCallback?.includes(
        'appendToDescription called but appendToDescriptionFn is not set yet'
      ) ||
      prevCallback?.trim() === '() => {\n          }' ||
      prevCallback?.trim() === '() => {}' ||
      (prevCallback && prevCallback.length < 50);

    // ALWAYS update the ref with the latest callback
    onTranscriptionRef.current = onTranscription;

    const newCallback = onTranscriptionRef.current
      ?.toString()
      .substring(0, 200);
    const newIsEmpty =
      newCallback?.includes(
        'appendToDescription called but appendToDescriptionFn is not set yet'
      ) ||
      newCallback?.trim() === '() => {\n          }' ||
      newCallback?.trim() === '() => {}' ||
      (newCallback && newCallback.length < 50);

    const isSameRef = prevCallback === newCallback;

    console.log('🔄 onTranscription callback updated in ref', {
      prevIsEmpty,
      newIsEmpty,
      isSameRef,
      isFunction: typeof onTranscription === 'function',
      callbackChanged: prevIsEmpty !== newIsEmpty,
      prevPreview: prevCallback,
      newPreview: newCallback,
      onTranscriptionType: typeof onTranscription,
      onTranscriptionPreview: onTranscription?.toString().substring(0, 200),
    });

    // If we just got a real callback (not empty), log it
    if (prevIsEmpty && !newIsEmpty) {
      console.log('✅✅✅ Real appendToDescription callback received in ref!');
    } else if (!prevIsEmpty && !newIsEmpty) {
      console.log('✅ Real callback still in ref');
    } else if (newIsEmpty) {
      console.warn(
        '⚠️⚠️⚠️ Still empty callback in ref - editor may not have mounted yet'
      );
    }
  }, [onTranscription]);

  const connect = useCallback(() => {
    // If WebSocket exists and is open, don't create a new one
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping connect');
      return;
    }

    // If WebSocket exists but not open, close it first to avoid duplicates
    if (wsRef.current) {
      console.log(
        'Existing WebSocket found but not open, closing before creating new one'
      );
      wsRef.current.close();
      wsRef.current = null;
    }

    // Connect directly to thoth-backend, just like thoth-frontend does
    const thothWsUrl = env.VITE_THOTH_WS_URL || 'wss://172.16.0.61:8443';
    const wsUrl = `${thothWsUrl}/stream-audio`;

    console.log('Connecting directly to Thoth WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected successfully to Thoth!');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message from Thoth:', data);

        // Only process valid, non-empty transcriptions
        if (
          data &&
          data.transcription !== undefined &&
          data.transcription !== null &&
          typeof data.transcription === 'string' &&
          data.transcription.trim() !== '' &&
          data.transcription !== 'undefined'
        ) {
          const trimmed = data.transcription.trim();
          console.log(`📨 Received transcription: "${trimmed}"`);

          // Use ref to get latest callback (avoids stale closure)
          const callback = onTranscriptionRef.current;

          if (!callback) {
            console.error('❌ onTranscription callback is null or undefined!');
            return;
          }

          if (typeof callback !== 'function') {
            console.error(
              '❌ onTranscription callback is not a function:',
              typeof callback
            );
            return;
          }

          const callbackStr = callback.toString();
          // Check if it's the wrapper callback (should contain "onTranscriptionCallback" or "appendToDescriptionFn")
          const isWrapperCallback =
            callbackStr.includes('onTranscriptionCallback') ||
            callbackStr.includes('appendToDescriptionFn');

          console.log('🔍 Callback analysis:', {
            isFunction: typeof callback === 'function',
            isWrapperCallback,
            callbackPreview: callbackStr.substring(0, 300),
          });

          // Always try to call it - the wrapper callback will handle the null check
          console.log('▶️ Calling onTranscription callback with:', trimmed);
          try {
            callback(trimmed);
            console.log(
              '✅ onTranscription callback executed - check if appendToDescription was called'
            );
          } catch (err) {
            console.error('❌ Error executing onTranscription callback:', err);
          }
        } else {
          console.debug('Skipping invalid transcription:', data);
        }
      } catch (err) {
        console.error('Error parsing transcription message:', err);
        setError('Failed to parse transcription message');
      }
    };

    ws.onerror = err => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error');
      setIsConnected(false);
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    ws.onclose = event => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    wsRef.current = ws;
  }, []); // Remove onTranscription from deps since we use ref

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('Disconnecting WebSocket...');
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
    }
    isRecordingRef.current = true; // Update ref immediately
    setIsRecording(true);
    setError(null);
    console.log('startRecording called - isRecording set to true');
  }, [connect]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false; // Update ref immediately
    setIsRecording(false);
    disconnect();
  }, [disconnect]);

  const sendAudioChunk = useCallback((chunk: ArrayBuffer) => {
    // Use ref for immediate state check (state variable might be stale in callback)
    if (
      wsRef.current?.readyState === WebSocket.OPEN &&
      isRecordingRef.current &&
      chunk &&
      chunk.byteLength > 0
    ) {
      try {
        // Log occasionally to avoid spam
        if (Math.random() < 0.01) {
          console.log(
            `Sending audio chunk to Thoth, size: ${chunk.byteLength} bytes`
          );
        }
        wsRef.current.send(chunk);
      } catch (err) {
        console.error('Error sending audio chunk:', err);
      }
    } else {
      // Log why chunk wasn't sent (occasionally)
      if (Math.random() < 0.05) {
        console.debug('Audio chunk not sent:', {
          readyState: wsRef.current?.readyState,
          isRecording: isRecordingRef.current,
          hasChunk: !!chunk,
          chunkSize: chunk?.byteLength || 0,
        });
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    error,
    startRecording,
    stopRecording,
    sendAudioChunk,
  };
};
