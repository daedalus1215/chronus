import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { NoteAudio } from '../../../../../../api/requests/audio.requests';
import { IconButton, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAudioPlayer } from '../../../../../../contexts/AudioPlayerContext';
import styles from './AudioHistoryView.module.css';

type AudioHistoryViewProps = {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  audios: NoteAudio[];
  isLoading: boolean;
  error?: string | null;
  onDownload: (audioId: number, fileName: string) => void;
  isDownloading: boolean;
};

export const AudioHistoryView: React.FC<AudioHistoryViewProps> = ({
  isOpen,
  onClose,
  noteId,
  audios,
  isLoading,
  error,
  onDownload,
  isDownloading,
}) => {
  const { currentTrack, isPlaying, loadAudio, togglePlay } = useAudioPlayer();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFormatLabel = (format: string) => {
    return format.toUpperCase();
  };

  const handlePlay = (audio: NoteAudio) => {
    if (currentTrack?.audioId === audio.id) {
      // Toggle play/pause for current track
      togglePlay();
    } else {
      // Load and play new track
      loadAudio({
        audioId: audio.id,
        fileName: audio.fileName,
        noteId: noteId,
      });
    }
  };

  const isCurrentTrack = (audioId: number) => currentTrack?.audioId === audioId;

  if (isLoading) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Audio History</h3>
          <div className={styles.loading}>Loading audio files...</div>
        </div>
      </BottomSheet>
    );
  }

  if (error) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Audio History</h3>
          <div className={styles.error}>{error}</div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Audio History</h3>
        {audios.length === 0 ? (
          <div className={styles.empty}>
            <HeadphonesIcon className={styles.emptyIcon} />
            <p>No audio files yet</p>
            <p className={styles.emptySubtext}>
              Convert text to speech to create audio files
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {audios.map((audio, index) => (
              <div key={audio.id} className={styles.audioItem}>
                <div className={styles.audioInfo}>
                  <div className={styles.audioHeader}>
                    <span className={styles.audioNumber}>
                      #{audios.length - index}
                    </span>
                    <Chip
                      label={getFormatLabel(audio.fileFormat)}
                      size="small"
                      className={styles.formatChip}
                    />
                  </div>
                  <div className={styles.audioDate}>
                    {formatDate(audio.createdAt)}
                  </div>
                  <div className={styles.audioFileName}>{audio.fileName}</div>
                </div>
                <div className={styles.actionButtons}>
                  <IconButton
                    aria-label={
                      isCurrentTrack(audio.id) && isPlaying
                        ? 'Pause audio'
                        : 'Play audio'
                    }
                    size="small"
                    onClick={() => handlePlay(audio)}
                    className={styles.playButton}
                    color={isCurrentTrack(audio.id) ? 'primary' : 'default'}
                  >
                    {isCurrentTrack(audio.id) && isPlaying ? (
                      <PauseIcon fontSize="small" />
                    ) : (
                      <PlayArrowIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    aria-label="Download audio"
                    size="small"
                    onClick={() => onDownload(audio.id, audio.fileName)}
                    disabled={isDownloading}
                    className={styles.downloadButton}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
