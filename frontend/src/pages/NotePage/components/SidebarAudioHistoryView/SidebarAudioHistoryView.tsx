import React, { useEffect, useState } from 'react';
import { Download, Trash2, Headphones, Play, Pause } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <div className={styles.sidebarAudio}>
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4 w-auto">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading audio files...
        </div>
      ) : audios.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-8 text-center text-muted-foreground">
          <Headphones className="size-10 opacity-50" />
          <p className="m-0">No audio files yet</p>
          <p className="m-0 text-[0.8125rem] opacity-70">
            Convert text to speech to create audio files
          </p>
        </div>
      ) : (
        <ul className={`${styles.list} min-h-0 flex-1 list-none overflow-y-auto p-0`}>
          {audios.map((audio, index) => (
            <li
              key={audio.id}
              className="border-b border-[var(--color-overlay-stronger)] px-4 py-2"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold">
                  #{audios.length - index}
                </span>
                <Badge variant="secondary">{audio.fileFormat.toUpperCase()}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(audio.createdAt)}
              </div>
              <div
                className={`${styles.fileName} mt-0.5 text-[0.8125rem]`}
                title={audio.fileName}
              >
                {audio.fileName}
              </div>

              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      isCurrentTrack(audio.id) && isPlaying
                        ? 'Pause audio'
                        : 'Play audio'
                    }
                    onClick={() => handlePlay(audio)}
                    className={isCurrentTrack(audio.id) ? 'text-primary' : undefined}
                  >
                    {isCurrentTrack(audio.id) && isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(audio.lastPositionSeconds)} /{' '}
                    {formatTime(audio.durationSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Download audio"
                    onClick={() => downloadAudio(audio.id, audio.fileName)}
                    disabled={isDownloading}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete audio"
                    onClick={() => setDeleteConfirmId(audio.id)}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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
    </div>
  );
};
