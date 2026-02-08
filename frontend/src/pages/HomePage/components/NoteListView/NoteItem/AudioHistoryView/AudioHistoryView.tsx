import React from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { NoteAudio } from '../../../../../../api/requests/audio.requests';
import { IconButton, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HeadphonesIcon from '@mui/icons-material/Headphones';
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
                    <span className={styles.audioNumber}>#{audios.length - index}</span>
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
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
