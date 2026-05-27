import React, { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import { NoteAudio } from '../../../../api/requests/audio.requests';
import { useAudioPlayer } from '../../../../contexts/AudioPlayerContext';
import { useNoteAudios } from '../../hooks/useNoteAudios/useNoteAudios';
import { useDeleteAudio } from '../../hooks/useDeleteAudio/useDeleteAudio';
import styles from './AudioHistoryView.module.css';

type AudioHistoryViewProps = {
  noteId: number;
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || Number.isNaN(seconds)) {
    return '—';
  }
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const AudioHistoryView: React.FC<AudioHistoryViewProps> = ({ noteId }) => {
  const { audios, isLoading, error, refetch } = useNoteAudios(noteId);
  const {
    currentTrack,
    currentTime,
    duration: currentDuration,
    isPlaying,
    close,
    loadAudio,
  } = useAudioPlayer();
  const deleteAudioMutation = useDeleteAudio(noteId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [audioPendingDelete, setAudioPendingDelete] = useState<NoteAudio | null>(null);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  const sortedAudios = useMemo(() => {
    return [...audios].sort((leftAudio: NoteAudio, rightAudio: NoteAudio) => {
      return (
        new Date(rightAudio.createdAt).getTime() - new Date(leftAudio.createdAt).getTime()
      );
    });
  }, [audios]);
  const handlePlayClick = (audio: NoteAudio): void => {
    loadAudio({
      audioId: audio.id,
      fileName: audio.fileName,
      noteId: audio.noteId,
      lastPositionSeconds: audio.lastPositionSeconds,
    });
  };
  const handleDeleteClick = (audio: NoteAudio): void => {
    setAudioPendingDelete(audio);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteCancel = (): void => {
    setIsDeleteDialogOpen(false);
    setAudioPendingDelete(null);
  };
  const handleDeleteConfirm = (): void => {
    if (!audioPendingDelete) {
      return;
    }
    if (currentTrack?.audioId === audioPendingDelete.id) {
      close();
    }
    deleteAudioMutation.mutate(audioPendingDelete.id, {
      onSettled: () => {
        handleDeleteCancel();
      },
    });
  };
  return (
    <Box className={styles.audioHistoryContainer}>
      {isLoading && (
        <Box className={styles.centeredState}>
          <CircularProgress size={20} />
        </Box>
      )}
      {error && !isLoading && (
        <Alert severity="error" sx={{ m: 1.5 }}>
          Failed to load audio recordings.
        </Alert>
      )}
      {!isLoading && !error && sortedAudios.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 1.5, py: 2 }}
        >
          No audio recordings for this note.
        </Typography>
      )}
      {!isLoading && !error && sortedAudios.length > 0 && (
        <List
          dense
          disablePadding
          sx={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {sortedAudios.map(audio => {
            const isActiveTrack = currentTrack?.audioId === audio.id;
            const playbackDuration = isActiveTrack
              ? currentDuration || audio.durationSeconds
              : audio.durationSeconds;
            const playbackText = isActiveTrack
              ? `${formatDuration(currentTime)} / ${formatDuration(playbackDuration)}`
              : formatDuration(audio.durationSeconds);
            return (
              <ListItem
                key={audio.id}
                disablePadding
                sx={{
                  py: 0.5,
                  px: 1.5,
                  alignItems: 'center',
                  borderBottom: '1px solid var(--color-overlay-stronger)',
                  backgroundColor: isActiveTrack ? 'rgba(99,102,241,0.08)' : 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  <IconButton
                    size="small"
                    aria-label={
                      isActiveTrack && isPlaying
                        ? `Currently playing ${audio.fileName}`
                        : `Play ${audio.fileName}`
                    }
                    onClick={() => handlePlayClick(audio)}
                    sx={{ color: isActiveTrack ? 'primary.main' : 'text.secondary' }}
                  >
                    {isActiveTrack ? (
                      <GraphicEqRounded fontSize="small" />
                    ) : (
                      <PlayArrowRounded fontSize="small" />
                    )}
                  </IconButton>
                  <ListItemText
                    primary={
                      <Tooltip title={audio.fileName}>
                        <span className={styles.fileName}>{audio.fileName}</span>
                      </Tooltip>
                    }
                    secondary={`${formatDateTime(audio.createdAt)} • ${playbackText}`}
                    sx={{
                      my: 0,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        color: isActiveTrack ? 'text.primary' : 'text.primary',
                      },
                      '& .MuiListItemText-secondary': {
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label={`Delete ${audio.fileName}`}
                    onClick={() => handleDeleteClick(audio)}
                    disabled={deleteAudioMutation.isPending}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteOutlineRounded fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete audio?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {audioPendingDelete
              ? `Delete "${audioPendingDelete.fileName}" from this note?`
              : 'Delete this recording from this note?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteAudioMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteAudioMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
