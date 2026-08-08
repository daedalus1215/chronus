import { useState, useRef, useCallback, useEffect } from 'react';

type UseTranscriptionWebSocketProps = {
  noteId: number;
  onTranscription: (text: string) => void;
  enabled: boolean;
};

type UseTranscriptionWebSocketReturn = {
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendAudioChunk: (chunk: ArrayBuffer) => void;
};

/**
 * The gateway authenticates via the WebSocket subprotocol, because browsers
 * cannot set an Authorization header on a handshake and query params leak into
 * access logs.
 */
const JWT_SUBPROTOCOL = 'chronus.jwt';

/**
 * Close codes defined by the backend gateway.
 * See backend/src/notes/apps/gateways/transcribe-audio.gateway.ts
 */
const CLOSE_CODE_MESSAGES: Record<number, string> = {
  4401: 'Your session expired — sign in again to keep recording',
  4403: "You don't have access to this note",
  4404: 'Note not found',
  4408: 'Recording stopped after the maximum session length',
  4409: 'A recording is already in progress',
  1011: 'Transcription service unavailable',
};

const buildGatewayUrl = (noteId: number): string => {
  // Derived from the page origin so it rides the same Vite proxy (ws: true) in
  // dev and preview, and the same origin in production. The frontend does not
  // know that thoth exists.
  const wsOrigin = window.location.origin.replace(/^http/, 'ws');
  return `${wsOrigin}/api/notes/transcribe-audio?noteId=${noteId}`;
};

export const useTranscriptionWebSocket = ({
  noteId,
  onTranscription,
  enabled,
}: UseTranscriptionWebSocketProps): UseTranscriptionWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isRecordingRef = useRef(false);
  // The gateway opens its upstream connection to the transcription service after
  // accepting ours, so audio sent before `ready` is discarded. Gate on it.
  const isReadyRef = useRef(false);
  const onTranscriptionRef = useRef(onTranscription);

  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
  }, [onTranscription]);

  const resetConnectionState = useCallback(() => {
    isReadyRef.current = false;
    isRecordingRef.current = false;
    setIsConnected(false);
    setIsRecording(false);
  }, []);

  const connect = useCallback((): Promise<void> => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isReadyRef.current) {
      return Promise.resolve();
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      const message = 'You must be signed in to record';
      setError(message);
      return Promise.reject(new Error(message));
    }

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(buildGatewayUrl(noteId), [
        JWT_SUBPROTOCOL,
        token,
      ]);
      // Resolve on `ready`, not on `open` — see isReadyRef above.
      let settled = false;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = event => {
        let message: { type?: string; text?: string; message?: string };
        try {
          message = JSON.parse(event.data);
        } catch {
          console.error('Unparseable frame from transcription gateway');
          return;
        }

        switch (message.type) {
          case 'ready':
            isReadyRef.current = true;
            settled = true;
            resolve();
            break;
          case 'transcription':
            if (message.text?.trim()) {
              onTranscriptionRef.current?.(message.text.trim());
            }
            break;
          case 'error':
            setError(message.message ?? 'Transcription error');
            break;
          default:
            console.debug('Unknown message type from gateway:', message.type);
        }
      };

      ws.onerror = () => {
        if (!settled) {
          setError('Could not connect to the transcription service');
        }
      };

      ws.onclose = event => {
        const message =
          CLOSE_CODE_MESSAGES[event.code] ??
          (event.wasClean
            ? null
            : event.reason || `Connection closed (code ${event.code})`);

        if (message) {
          setError(message);
        }
        resetConnectionState();

        if (!settled) {
          settled = true;
          reject(new Error(message ?? 'Connection closed'));
        }
      };

      wsRef.current = ws;
    });
  }, [noteId, resetConnectionState]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    resetConnectionState();
  }, [resetConnectionState]);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!enabled) {
      return;
    }
    setError(null);
    await connect();
    isRecordingRef.current = true;
    setIsRecording(true);
  }, [connect, enabled]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    disconnect();
  }, [disconnect]);

  const sendAudioChunk = useCallback((chunk: ArrayBuffer) => {
    if (
      wsRef.current?.readyState !== WebSocket.OPEN ||
      !isReadyRef.current ||
      !isRecordingRef.current ||
      !chunk?.byteLength
    ) {
      return;
    }

    try {
      wsRef.current.send(chunk);
    } catch (err) {
      console.error('Error sending audio chunk:', err);
    }
  }, []);

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
