import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteActionsGrid } from './NoteActionGrid/NoteActionGrid';
import { DateTimePicker } from './DateTimePicker/DateTimePicker';
import {
  TimeTrackingForm,
  TimeTrackingData,
} from './TimeTrackingForm/TimeTrackingForm';
import { TimeTrackListView } from './TimeTrackListView/TimeTrackListView';
import { useNoteTimeTracks } from '../../../hooks/useNoteTimeTracks/useNoteTimeTracks';
import { useAudioActions } from '../../../hooks/useAudioActions/useAudioActions';
import { useCreateTimeTrack } from '../../../hooks/useCreateTimeTrack/useCreateTimeTrack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  deleteNote,
  updateNoteTimestamp,
} from '../../../../../api/requests/notes.requests';
import styles from './NoteItem.module.css';
import { useArchiveNote } from '../../../hooks/useArchiveNote';

type Note = { name: string; id: number; isMemo: number };

interface NoteItemProps {
  note: Note;
  onClick?: () => void;
  isSelected?: boolean;
  /** When true, uses smaller padding and font so more items fit on screen (e.g. desktop list). */
  compact?: boolean;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onClick,
  isSelected,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isTimeTrackListOpen, setIsTimeTrackListOpen] = useState(false);
  const {
    createTimeTrack,
    isCreating,
    error: createTimeTrackError,
  } = useCreateTimeTrack();
  const { archiveNote, isArchiving } = useArchiveNote();
  const {
    timeTracks,
    isLoadingTimeTracks,
    totalTimeData,
    isLoadingTotal,
    timeTrackError,
  }: ReturnType<typeof useNoteTimeTracks> = useNoteTimeTracks(
    note.id,
    isTimeTrackListOpen
  );
  const {
    handleTextToSpeech,
    handleDownloadAudio,
    isConverting,
    isDownloading,
    error: audioError,
  } = useAudioActions(note.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>(
    'success'
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/notes/${note.id}`);
    }
  };

  const handleMoreClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateNoteTimestamp(note.id);
      setIsActionsOpen(true);
    } catch (error) {
      console.error('Failed to update note timestamp:', error);
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response
      ) {
        // @ts-expect-error: error type is unknown but we expect response.data for logging
        console.error('Error response:', error.response.data);
        // @ts-expect-error: error type is unknown but we expect response.status for logging
        console.error('Error status:', error.response.status);
      }
      // Still open the actions menu even if the timestamp update fails
      setIsActionsOpen(true);
    }
  };

  const handleShare = () => {
    setIsActionsOpen(false);
  };

  const handleDuplicate = () => {
    setIsActionsOpen(false);
  };

  const handleDelete = () => {
    setIsActionsOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleArchive = () => {
    setIsActionsOpen(false);
    setArchiveDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteNote(note.id);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      setIsDeleting(false);
      let message = 'Failed to delete note';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setDeleteError(message);
    }
  };

  const confirmArchive = async () => {
    setArchiveError(null);
    try {
      await archiveNote(note.id);
      setArchiveDialogOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      let message = 'Failed to archive note';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setArchiveError(message);
    }
  };

  const handleTimeTracking = () => {
    setIsActionsOpen(false);
    setIsTimeTrackingOpen(true);
  };

  const handleViewTimeEntries = () => {
    setIsActionsOpen(false);
    setIsTimeTrackListOpen(true);
  };

  const handleTimeTrackingSubmit = async (data: TimeTrackingData) => {
    try {
      await createTimeTrack({
        date: data.date,
        startTime: data.startTime,
        durationMinutes:
          data.durationMinutes === undefined ? 1 : Number(data.durationMinutes),
        noteId: note.id,
        note: data.note,
      });
      setIsTimeTrackingOpen(false);
      setToastSeverity('success');
      setToastMessage('Time track saved successfully');
    } catch {
      setToastSeverity('error');
      const errorMessage = createTimeTrackError || 'Failed to save time track';
      setToastMessage(errorMessage);
    }
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  return (
    <>
      <div
        className={`${styles.noteListItem} ${isSelected ? styles.selected : ''} ${compact ? styles.compact : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <div className={styles.noteInfo}>
          <span className={styles.noteName}>{note.name}</span>
          <span className={styles.noteType}>
            {note.isMemo ? 'Memo' : 'List'}
          </span>
        </div>
        <button
          className={styles.moreButton}
          onClick={handleMoreClick}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>

      <NoteActionsGrid
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onShare={handleShare}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onTimeTracking={handleTimeTracking}
        onViewTimeEntries={handleViewTimeEntries}
        onPin={handleTimeTracking}
        onStar={handleTimeTracking}
        onTextToSpeech={handleTextToSpeech}
        onDownloadAudio={handleDownloadAudio}
        onEdit={handleTimeTracking}
        onLabel={handleTimeTracking}
        onExport={handleTimeTracking}
        onLock={handleTimeTracking}
        isConverting={isConverting}
        isDownloading={isDownloading}
        audioError={audioError}
      />

      <DateTimePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={() => setIsDatePickerOpen(false)}
        initialDate={new Date()}
      />

      <TimeTrackingForm
        isOpen={isTimeTrackingOpen}
        onClose={() => setIsTimeTrackingOpen(false)}
        onSubmit={handleTimeTrackingSubmit}
        isSubmitting={isCreating}
        hasPendingTracks={false}
      />

      <TimeTrackListView
        isOpen={isTimeTrackListOpen}
        onClose={() => setIsTimeTrackListOpen(false)}
        noteId={note.id}
        timeTracks={timeTracks}
        isLoadingTimeTracks={isLoadingTimeTracks}
        error={timeTrackError || undefined}
        totalTimeData={totalTimeData}
        isLoadingTotal={isLoadingTotal}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Note?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this note? This action cannot be
          undone.
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        aria-labelledby="archive-dialog-title"
      >
        <DialogTitle id="archive-dialog-title">Archive Note?</DialogTitle>
        <DialogContent>
          Are you sure you want to archive this note? It will be hidden from
          your main list but can be restored later.
          {archiveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {archiveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setArchiveDialogOpen(false)}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmArchive}
            color="warning"
            variant="contained"
            disabled={isArchiving}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastMessage !== null}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
