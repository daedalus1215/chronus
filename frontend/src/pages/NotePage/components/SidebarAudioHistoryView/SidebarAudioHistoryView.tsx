import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { NoteAudio } from '@/api/requests/audio.requests';
import { useAudioPlayer } from '@/contexts/useAudioPlayer';
import { useNoteAudios } from '../../hooks/useNoteAudios/useNoteAudios';
import styles from './SidebarAudioHistoryView.module.css';

type SidebarAudioHistoryViewProps = {
  noteId: number;
};

const formatTime = (seconds: number | null): string => {
  if (seconds == null || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const SidebarAudioHistoryView: React.FC<
  SidebarAudioHistoryViewProps
> = ({ noteId }) => {
  const {
    audios,
    isLoading,
    error,
    refetch,
    deleteAudio,
    isDeleting,
    downloadAudio,
    isDownloading,
  } = useNoteAudios(noteId);
  const { currentTrack, isPlaying, loadAudio, togglePlay } = useAudioPlayer();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Query is lazy (enabled: false) — fetch when the tab is shown.
  useEffect(() => {
    void refetch();
  }, [refetch, noteId]);

  const isCurrentTrack = (audioId: number): boolean =>
    currentTrack?.audioId === audioId;

  const handlePlay = (audio: NoteAudio): void => {
    if (isCurrentTrack(audio.id)) {
      togglePlay();
    } else {
      loadAudio({
        audioId: audio.id,
        fileName: audio.fileName,
        noteId,
        lastPositionSeconds: audio.lastPositionSeconds,
      });
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deleteConfirmId === null) return;
    try {
      await deleteAudio(deleteConfirmId);
    } catch (err) {
      console.error('Failed to delete audio:', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <Box className={styles.sidebarAudio}>
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ p: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
          Loading audio files...
        </Box>
      ) : audios.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 0.5,
            px: 2,
            py: 4,
            color: 'text.secondary',
          }}
        >
          <HeadphonesIcon sx={{ fontSize: 40, opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No audio files yet</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.7 }}>
            Convert text to speech to create audio files
          </p>
        </Box>
      ) : (
        <List
          className={styles.list}
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {audios.map((audio, index) => (
            <Box
              key={audio.id}
              sx={{
                borderBottom: '1px solid var(--color-overlay-stronger)',
                px: 2,
                py: 1,
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
              >
                <Box
                  component="span"
                  sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                >
                  #{audios.length - index}
                </Box>
                <Chip label={audio.fileFormat.toUpperCase()} size="small" />
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {formatDate(audio.createdAt)}
              </Box>
              <Box
                className={styles.fileName}
                sx={{ fontSize: '0.8125rem', mt: 0.25 }}
                title={audio.fileName}
              >
                {audio.fileName}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    aria-label={
                      isCurrentTrack(audio.id) && isPlaying
                        ? 'Pause audio'
                        : 'Play audio'
                    }
                    size="small"
                    onClick={() => handlePlay(audio)}
                    color={isCurrentTrack(audio.id) ? 'primary' : 'default'}
                  >
                    {isCurrentTrack(audio.id) && isPlaying ? (
                      <PauseIcon fontSize="small" />
                    ) : (
                      <PlayArrowIcon fontSize="small" />
                    )}
                  </IconButton>
                  <Box
                    component="span"
                    sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  >
                    {formatTime(audio.lastPositionSeconds)} /{' '}
                    {formatTime(audio.durationSeconds)}
                  </Box>
                </Box>

                <Box>
                  <IconButton
                    aria-label="Download audio"
                    size="small"
                    onClick={() => downloadAudio(audio.id, audio.fileName)}
                    disabled={isDownloading}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Delete audio"
                    size="small"
                    onClick={() => setDeleteConfirmId(audio.id)}
                    disabled={isDeleting}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </List>
      )}

      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        aria-labelledby="delete-audio-dialog-title"
      >
        <DialogTitle id="delete-audio-dialog-title">Delete Audio</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete this audio file? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
