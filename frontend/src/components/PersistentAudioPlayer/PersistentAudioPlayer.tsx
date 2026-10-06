import React from 'react';
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  AudioLines,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import styles from './PersistentAudioPlayer.module.css';
import { useAudioPlayer } from '@/contexts/useAudioPlayer';

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PersistentAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isExpanded,
    togglePlay,
    seek,
    setVolume,
    toggleExpanded,
    close,
  } = useAudioPlayer();

  // Don't render if no track is loaded
  if (!currentTrack) {
    return null;
  }

  // Minimized state - just show FAB
  if (!isExpanded) {
    return (
      <div className={styles.playerWidget}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={`${styles.fabButton} rounded-full`}
              onClick={toggleExpanded}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : isPlaying ? (
                <AudioLines className="text-white" />
              ) : (
                <Play className="text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {currentTrack.fileName} {isPlaying ? '(Playing)' : '(Paused)'}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Expanded state - full mini player
  return (
    <div className={styles.playerWidget}>
      <div className={`${styles.playerCard} w-80`}>
        <div className="p-4">
          {/* Header with filename and close */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isPlaying && (
                <div className={styles.playingIndicator}>
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                </div>
              )}
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {currentTrack.fileName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={close}
              className="ml-1"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Seek bar */}
          <div className={`${styles.seekBar} mb-1`}>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              onValueChange={([value]) => seek(value)}
              disabled={isLoading}
              className="[&_[data-slot=slider-thumb]]:size-3"
            />
            <div className="mt-0.5 flex justify-between">
              <span className="text-[0.7rem] text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <span className="text-[0.7rem] text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
              >
                {volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => setVolume(value)}
                className={`${styles.volumeSlider} [&_[data-slot=slider-thumb]]:size-2.5`}
              />
            </div>

            <Button
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              className="rounded-full disabled:opacity-30"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="text-white" />
              ) : (
                <Play className="text-white" />
              )}
            </Button>

            {/* Spacer to balance layout */}
            <div className="w-[60px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
