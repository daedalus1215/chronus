import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import api from '../api/axios.interceptor';

export interface AudioTrack {
  audioId: number;
  fileName: string;
  noteId: number;
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isExpanded: boolean;
  loadAudio: (track: AudioTrack) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleExpanded: () => void;
  close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      'useAudioPlayer must be used within an AudioPlayerProvider'
    );
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Set up event listeners
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      console.error('Audio error:', {
        error: audio.error,
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
      });
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Restore volume from localStorage
    const savedVolume = localStorage.getItem('audioPlayerVolume');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      audio.volume = vol;
      setVolumeState(vol);
    }

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      // Clean up blob URL on unmount
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, []);

  const loadAudio = useCallback(
    async (track: AudioTrack) => {
      if (!audioRef.current) return;

      // If loading the same track, just play it
      if (currentTrack?.audioId === track.audioId) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Failed to play:', error);
          });
        return;
      }

      // Load new track
      const audio = audioRef.current;

      // Reset state first
      setCurrentTrack(track);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsExpanded(true);
      setIsLoading(true);

      try {
        // Fetch audio via axios (includes JWT token) and create blob URL
        const response = await api.get(`/audio/stream/${track.audioId}`, {
          responseType: 'blob',
        });

        const audioBlob = response.data as Blob;
        const blobUrl = URL.createObjectURL(audioBlob);

        // Clean up previous blob URL if exists
        if (audio.src && audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }

        // Set source and load
        audio.src = blobUrl;
        audio.load();

        // Auto-play when loaded
        const playWhenReady = () => {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Failed to autoplay:', error);
              setIsPlaying(false);
              setIsLoading(false);
            });
        };

        const handleError = (e: Event) => {
          const target = e.target as HTMLAudioElement;
          console.error('Failed to load audio:', target.error);
          setIsLoading(false);
          setIsPlaying(false);
        };

        audio.addEventListener('canplay', playWhenReady, { once: true });
        audio.addEventListener('error', handleError, { once: true });
      } catch (error) {
        console.error('Failed to fetch audio:', error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [currentTrack]
  );

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    // Check if audio is ready to play
    if (audio.readyState < 2) {
      // HAVE_CURRENT_DATA or higher needed
      console.log('Audio not ready yet, waiting...');
      setIsLoading(true);

      const tryPlay = () => {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Failed to play:', error);
            setIsLoading(false);
          });
      };

      audio.addEventListener('canplay', tryPlay, { once: true });
      audio.addEventListener(
        'error',
        () => {
          console.error('Audio load error');
          setIsLoading(false);
        },
        { once: true }
      );
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(error => {
        console.error('Failed to play:', error);
      });
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;

      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    },
    [duration]
  );

  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolumeState(clampedVolume);
    localStorage.setItem('audioPlayerVolume', clampedVolume.toString());
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Clean up blob URL if exists
      if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsExpanded(false);
  }, []);

  const value: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isExpanded,
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleExpanded,
    close,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
