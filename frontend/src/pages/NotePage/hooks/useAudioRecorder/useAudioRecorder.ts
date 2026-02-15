import { useState, useRef, useCallback, useEffect } from 'react';

type UseAudioRecorderProps = {
  onAudioChunk: (chunk: ArrayBuffer) => void;
  enabled: boolean;
};

type UseAudioRecorderReturn = {
  isRecording: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  checkMicrophoneAvailability: () => Promise<{
    available: boolean;
    error?: string;
  }>;
};

const AUDIO_SAMPLE_RATE = 16000;
const AUDIO_CHANNELS = 1;
const BUFFER_SIZE = 4096;
// Silence threshold - RMS (root mean square) below this is considered silence
const SILENCE_THRESHOLD = 0.0; // Adjust based on your needs (0.0 to 1.0)

export const useAudioRecorder = ({
  onAudioChunk,
  enabled,
}: UseAudioRecorderProps): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Use ref for callback access

  const checkMicrophoneAvailability = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          available: false,
          error: 'getUserMedia not supported in this browser',
        };
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        device => device.kind === 'audioinput'
      );

      if (audioInputs.length === 0) {
        try {
          const probeStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          probeStream.getTracks().forEach(track => track.stop());
          return { available: true };
        } catch (probeError) {
          if (probeError instanceof Error && probeError.name === 'NotFoundError') {
            return {
              available: false,
              error: 'No audio input devices found',
            };
          }
          return {
            available: true,
          };
        }
      }

      return { available: true };
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        return {
          available: false,
          error: 'No audio input devices found',
        };
      }
      return {
        available: true,
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error checking microphone',
      };
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Try to get media stream with fallback constraints
      let stream: MediaStream;
      const basicConstraints = { audio: true };
      const fallbackConstraints = {
        audio: {
          sampleRate: AUDIO_SAMPLE_RATE,
          channelCount: AUDIO_CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      } catch (firstError) {
        console.warn(
          'First attempt failed, trying fallback constraints:',
          firstError
        );
        try {
          stream =
            await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } catch (secondError) {
          console.warn(
            'Fallback attempt failed, trying basic audio:',
            secondError
          );
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      }

      mediaStreamRef.current = stream;

      // Create Audio Context
      try {
        audioContextRef.current = new AudioContext({
          sampleRate: AUDIO_SAMPLE_RATE,
        });
      } catch (contextError) {
        console.warn(
          `Failed to create AudioContext with ${AUDIO_SAMPLE_RATE}Hz, using default:`,
          contextError
        );
        audioContextRef.current = new AudioContext();
      }

      // Create source from stream
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      // Create script processor for raw audio data
      processorRef.current = audioContextRef.current.createScriptProcessor(
        BUFFER_SIZE,
        1,
        1
      );

      processorRef.current.onaudioprocess = e => {
        // Only process and send audio if enabled AND we're actually recording
        // Use ref to get current recording state (state variable might be stale in closure)
        if (enabled && isRecordingRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Simple silence detection: calculate RMS (root mean square)
          let sumSquares = 0;
          for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sumSquares / inputData.length);

          // Only send if not silence (above threshold)
          if (rms >= SILENCE_THRESHOLD) {
            // Send the raw Float32Array buffer directly, just like thoth-frontend does
            // Thoth expects Float32Array format, not 16-bit PCM
            // Log occasionally to avoid spam
            if (Math.random() < 0.01) {
              console.log(
                `Sending audio chunk (Float32Array), size: ${inputData.buffer.byteLength} bytes, RMS: ${rms.toFixed(4)}`
              );
            }
            onAudioChunk(inputData.buffer);
          } else {
            // Log silence detection occasionally
            if (Math.random() < 0.01) {
              console.debug(
                `Skipping silent audio chunk, RMS: ${rms.toFixed(4)}`
              );
            }
          }
        }
      };

      // Connect the nodes
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // Set recording state - update both state and ref
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unknown error accessing microphone';
      setError(errorMessage);

      // Provide user-friendly error messages
      if (err instanceof Error) {
        if (err.name === 'NotFoundError') {
          setError(
            'No microphone found. Please check your microphone connection.'
          );
        } else if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access.');
        } else if (err.name === 'NotSupportedError') {
          setError('Microphone not supported in this browser.');
        }
      }

      isRecordingRef.current = false;
      setIsRecording(false);
      throw err;
    }
  }, [enabled, onAudioChunk]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Update both state and ref
    isRecordingRef.current = false;
    setIsRecording(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    checkMicrophoneAvailability,
  };
};
