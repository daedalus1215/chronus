import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { NoteAudio } from '../../../../../../api/requests/audio.requests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Trash2, Headphones, Play, Pause } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/useAudioPlayer';
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
  onDelete: (audioId: number) => void;
  isDeleting: boolean;
};

const formatTime = (seconds: number | null): string => {
  if (seconds == null || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
  onDelete,
  isDeleting,
}) => {
  const { currentTrack, isPlaying, loadAudio, togglePlay } = useAudioPlayer();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmId === null) return;
    onDelete(deleteConfirmId);
    setDeleteConfirmId(null);
  };

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
        lastPositionSeconds: audio.lastPositionSeconds,
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
            <Headphones className={styles.emptyIcon} />
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
                    <Badge variant="secondary" className={styles.formatChip}>
                      {getFormatLabel(audio.fileFormat)}
                    </Badge>
                  </div>
                  <div className={styles.audioDate}>
                    {formatDate(audio.createdAt)}
                  </div>
                  <div className={styles.audioFileName}>{audio.fileName}</div>
                </div>
                <div className={styles.actionButtons}>
                  <div className={styles.playColumn}>
                    <button
                      type="button"
                      aria-label={
                        isCurrentTrack(audio.id) && isPlaying
                          ? 'Pause audio'
                          : 'Play audio'
                      }
                      onClick={() => handlePlay(audio)}
                      className={styles.playButton}
                      data-active={isCurrentTrack(audio.id)}
                    >
                      {isCurrentTrack(audio.id) && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                    <span className={styles.audioTime}>
                      {formatTime(audio.lastPositionSeconds)} /{' '}
                      {formatTime(audio.durationSeconds)}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Download audio"
                    onClick={() => onDownload(audio.id, audio.fileName)}
                    disabled={isDownloading}
                    className={styles.downloadButton}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete audio"
                    onClick={() => setDeleteConfirmId(audio.id)}
                    disabled={isDeleting}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Audio</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete this audio file? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BottomSheet>
  );
};
