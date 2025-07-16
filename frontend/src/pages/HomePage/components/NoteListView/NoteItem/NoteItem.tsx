import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteActionsGrid } from './NoteActionGrid/NoteActionGrid';
import { DateTimePicker } from './DateTimePicker/DateTimePicker';
import { TimeTrackingForm, TimeTrackingData } from './TimeTrackingForm/TimeTrackingForm';
import { TimeTrackListView } from './TimeTrackListView/TimeTrackListView';
import { useCreateTimeTrack } from '../../../hooks/useCreateTimeTrack/useCreateTimeTrack';
import { useNoteTimeTracks } from '../../../hooks/useNoteTimeTracks/useNoteTimeTracks';
import { useArchiveNote } from '../../../hooks/useArchiveNote';
import api from '../../../../../api/axios.interceptor';
import styles from './NoteItem.module.css';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

interface Note {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

interface NoteItemProps {
  note: Note;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isTimeTrackListOpen, setIsTimeTrackListOpen] = useState(false);
  const { createTimeTrack, isCreating } = useCreateTimeTrack();
  const { archiveNote, isArchiving } = useArchiveNote();
  const { timeTracks, isLoadingTimeTracks, totalTimeData, isLoadingTotal, timeTrackError } = useNoteTimeTracks(note.id, isTimeTrackListOpen);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const handleClick = () => {
    navigate(`/notes/${note.id}`);
  };

  const handleMoreClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.patch(`/notes/${note.id}/timestamp`);
      console.log('Update response:', response);
      setIsActionsOpen(true);
    } catch (error) {
      console.error('Failed to update note timestamp:', error);
      if (error && typeof error === 'object' && 'response' in error && error.response) {
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
      await api.delete(`/notes/${note.id}`);
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
        durationMinutes: data.durationMinutes === undefined ? 1 : Number(data.durationMinutes),
        noteId: note.id,
        note: data.note
      });
      setIsTimeTrackingOpen(false);
    } catch {
      // Error handling is now done in the hook
    }
  };

  return (
    <>
      <div 
        className={`${styles.noteListItem}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
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
        onExport={handleTimeTracking}
        onLock={handleTimeTracking}
        onEdit={handleTimeTracking}
        onLabel={handleTimeTracking}
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
        error={timeTrackError}
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
          Are you sure you want to delete this note? This action cannot be undone.
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
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
          Are you sure you want to archive this note? It will be hidden from your main list but can be restored later.
          {archiveError && <Alert severity="error" sx={{ mt: 2 }}>{archiveError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)} disabled={isArchiving}>
            Cancel
          </Button>
          <Button onClick={confirmArchive} color="warning" variant="contained" disabled={isArchiving}>
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

