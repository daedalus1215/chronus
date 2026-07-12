import { createContext } from 'react';

export interface AudioTrack {
  audioId: number;
  fileName: string;
  noteId: number;
  lastPositionSeconds: number | null;
}

export interface AudioPlayerContextType {
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

export const AudioPlayerContext = createContext<
  AudioPlayerContextType | undefined
>(undefined);
