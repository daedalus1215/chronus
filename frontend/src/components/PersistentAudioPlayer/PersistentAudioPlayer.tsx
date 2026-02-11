import React from 'react';
import {
  Fab,
  Card,
  CardContent,
  IconButton,
  Slider,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Close,
  VolumeUp,
  VolumeOff,
  GraphicEq,
} from '@mui/icons-material';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import styles from './PersistentAudioPlayer.module.css';

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
        <Tooltip
          title={`${currentTrack.fileName} ${isPlaying ? '(Playing)' : '(Paused)'}`}
        >
          <Fab
            size="small"
            className={styles.fabButton}
            onClick={toggleExpanded}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : isPlaying ? (
              <GraphicEq sx={{ color: 'white' }} />
            ) : (
              <PlayArrow sx={{ color: 'white' }} />
            )}
          </Fab>
        </Tooltip>
      </div>
    );
  }

  // Expanded state - full mini player
  return (
    <div className={styles.playerWidget}>
      <Card className={styles.playerCard} sx={{ width: 320 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header with filename and close */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              flex={1}
              minWidth={0}
            >
              {isPlaying && (
                <Box className={styles.playingIndicator}>
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                  <div className={styles.bar} />
                </Box>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ flex: 1, fontSize: '0.75rem' }}
              >
                {currentTrack.fileName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={close} sx={{ p: 0.5, ml: 1 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Seek bar */}
          <Box className={styles.seekBar} mb={1}>
            <Slider
              size="small"
              value={currentTime}
              max={duration || 100}
              onChange={(_, value) => seek(value as number)}
              disabled={isLoading}
              sx={{
                color: '#6366f1',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#6366f1',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                {formatTime(currentTime)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.7rem"
              >
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                size="small"
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                sx={{ p: 0.5 }}
              >
                {volume === 0 ? (
                  <VolumeOff fontSize="small" />
                ) : (
                  <VolumeUp fontSize="small" />
                )}
              </IconButton>
              <Slider
                size="small"
                value={volume}
                max={1}
                step={0.1}
                onChange={(_, value) => setVolume(value as number)}
                className={styles.volumeSlider}
                sx={{
                  color: '#6366f1',
                  width: 60,
                  '& .MuiSlider-thumb': {
                    width: 10,
                    height: 10,
                  },
                }}
              />
            </Box>

            <IconButton
              size="medium"
              onClick={togglePlay}
              disabled={isLoading}
              sx={{
                backgroundColor: '#6366f1',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </IconButton>

            {/* Spacer to balance layout */}
            <Box width={60} />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};
