import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useIsMobile } from '../../../../../hooks/useIsMobile';
import { AudioHistoryView } from './AudioHistoryView/AudioHistoryView';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  convertChecklistToMemo,
  deleteNote,
  updateNoteTimestamp,
} from '../../../../../api/requests/notes.requests';
import { Pin } from 'lucide-react';
import styles from './NoteItem.module.css';
import { useArchiveNote } from '../../../hooks/useArchiveNote';
import { useExportNote } from '../../../hooks/useExportNote';
import {
  useMergeIntoNote,
  MergeIntoNoteData,
} from '../../../hooks/useMergeIntoNote';
import { usePinNote } from '../../../hooks/usePinNote';
import { MergeSelectionDialog } from '../../MergeSelectionDialog/MergeSelectionDialog';
import { ParsedMemo } from '../../ImportSelectionDialog/ImportSelectionDialog';
import { MoveNoteDialog } from '../../../../../components/MoveNoteDialog/MoveNoteDialog';
import { useMoveNoteToFolder } from '../../../../../pages/NotePage/hooks/useMoveNoteToFolder/useMoveNoteToFolder';
import type { FolderDto } from '../../../../../api/dtos/folder.dtos';

type Note = {
  name: string;
  id: number;
  isMemo: number;
  folderId: number | null;
  pinned: boolean;
};

interface NoteItemProps {
  note: Note;
  onClick?: () => void;
  isSelected?: boolean;
  /** When true, uses smaller padding and font so more items fit on screen (e.g. desktop list). */
  compact?: boolean;
  /** Applies an optimistic pin-state change to the owning list. */
  onPinnedChange?: (noteId: number, pinned: boolean) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onClick,
  isSelected,
  compact = false,
  onPinnedChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const mergeFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [mergeMemo, setMergeMemo] = useState<{
    version: number;
    memo: ParsedMemo;
  } | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isTimeTrackListOpen, setIsTimeTrackListOpen] = useState(false);
  const [isAudioHistoryOpen, setIsAudioHistoryOpen] = useState(false);
  const {
    createTimeTrack,
    isCreating,
    error: createTimeTrackError,
  } = useCreateTimeTrack();
  const { archiveNote, isArchiving } = useArchiveNote();
  const { pinNote, isPinning } = usePinNote();
  const { exportNote } = useExportNote();
  const {
    moveNote,
    error: moveError,
    clearError: clearMoveError,
    snackbarMessage: moveSnackbarMessage,
    closeSnackbar: closeMoveSnackbar,
  } = useMoveNoteToFolder(note.id);
  const { mergeIntoNote, isMerging } = useMergeIntoNote(note.id);
  const {
    timeTracks,
    isLoadingTimeTracks,
    totalTimeData,
    isLoadingTotal,
    timeTrackError,
  }: ReturnType<typeof useNoteTimeTracks> = useNoteTimeTracks(
    note.id,
    isTimeTrackListOpen || mergeMemo !== null
  );
  const {
    handleTextToSpeech,
    handleDownloadAudio,
    handleDeleteAudio,
    fetchAudioHistory,
    audioHistory,
    isConverting,
    isDownloading,
    isDeleting: isAudioDeleting,
    isHistoryLoading,
    error: audioError,
  } = useAudioActions(note.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConvertingToMemo, setIsConvertingToMemo] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (moveSnackbarMessage !== null) {
      toast.success(moveSnackbarMessage);
      closeMoveSnackbar();
    }
  }, [moveSnackbarMessage, closeMoveSnackbar]);

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
  const handlePin = async () => {
    const nextPinned = !note.pinned;
    setIsActionsOpen(false);
    onPinnedChange?.(note.id, nextPinned);
    try {
      await pinNote(note.id, nextPinned);
    } catch (err) {
      console.error('Failed to update pin state:', err);
      onPinnedChange?.(note.id, !nextPinned);
      toast.error('Failed to update pin state');
    }
  };

  const handleDelete = () => {
    setIsActionsOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleArchive = () => {
    setIsActionsOpen(false);
    setArchiveDialogOpen(true);
  };
  const handleMoveToFolder = () => {
    clearMoveError();
    setIsActionsOpen(false);
    setIsMoveDialogOpen(true);
  };

  const handleMoveConfirm = async (folder: FolderDto | null) => {
    try {
      await moveNote(folder);
      setIsMoveDialogOpen(false);
    } catch {
      // Error is exposed via the hook; the dialog stays open with the
      // message and the user can retry.
    }
  };

  const handleMoveDialogClose = () => {
    setIsMoveDialogOpen(false);
    clearMoveError();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteNote(note.id);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      const parentPath = location.pathname.split('/notes/')[0];
      navigate(parentPath || '/', { replace: true });
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
      const parentPath = location.pathname.split('/notes/')[0];
      navigate(parentPath || '/', { replace: true });
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

  const handleViewBoard = () => {
    setIsActionsOpen(false);
    navigate(`/notes/${note.id}/kanban`);
  };

  const handleLabel = () => {
    setIsActionsOpen(false);
    // Open the note (if needed) with the right sidebar on the Tags tab;
    // NotePage consumes ?sidebar= and strips it.
    const basePath = location.pathname.split('/notes/')[0];
    const targetPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    navigate(`${targetPath}notes/${note.id}?sidebar=tags`, {
      replace: !isMobile,
    });
  };

  const handleEdit = () => {
    setIsActionsOpen(false);
    // Open the note in edit mode; NotePage consumes ?edit=1 and strips it.
    // Checklists have no edit mode — the param is a no-op there.
    const basePath = location.pathname.split('/notes/')[0];
    const targetPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    navigate(`${targetPath}notes/${note.id}?edit=1`, {
      replace: !isMobile,
    });
  };

  const handleConvertToMemo = () => {
    setIsActionsOpen(false);
    setConvertDialogOpen(true);
  };

  const handleViewAudioHistory = () => {
    setIsActionsOpen(false);
    setIsAudioHistoryOpen(true);
    fetchAudioHistory();
  };

  const handleExport = async () => {
    setIsActionsOpen(false);
    try {
      await exportNote(note.id, note.name);
      toast.success('Note exported successfully');
    } catch (err) {
      console.error('Failed to export note:', err);
      toast.error('Failed to export note');
    }
  };

  const handleImportIntoNote = () => {
    setIsActionsOpen(false);
    mergeFileInputRef.current?.click();
  };

  const handleMergeFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again re-triggers onChange.
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      // Export files are nested: { version, exportedAt, memo: { ... } }.
      const parsed = JSON.parse(text) as {
        version: number;
        memo: ParsedMemo;
      };

      if (parsed.version !== 1) {
        toast.error(`Unsupported file version: ${parsed.version}`);
        return;
      }

      if (!parsed.memo?.name) {
        toast.error('Invalid .chronus file: missing memo name.');
        return;
      }

      setMergeMemo({ version: parsed.version, memo: parsed.memo });
    } catch (err) {
      console.error('Failed to read .chronus file:', err);
      toast.error('Failed to read file. Please check the file format.');
    }
  };

  const handleConfirmMerge = async (payload: MergeIntoNoteData) => {
    try {
      await mergeIntoNote(payload);
      setMergeMemo(null);
      toast.success('Imported into memo successfully');
    } catch (err) {
      console.error('Failed to import into memo:', err);
      toast.error('Failed to import into memo');
    }
  };

  const confirmConvertToMemo = async () => {
    setIsConvertingToMemo(true);
    setConvertError(null);
    try {
      await convertChecklistToMemo(note.id);
      setConvertDialogOpen(false);
      const parentPath = location.pathname.split('/notes/')[0];
      navigate(parentPath || '/', { replace: true });
    } catch (err: unknown) {
      let message = 'Failed to convert note to memo';
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
      setConvertError(message);
    } finally {
      setIsConvertingToMemo(false);
    }
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
      toast.success('Time track saved successfully');
    } catch {
      toast.error(createTimeTrackError || 'Failed to save time track');
    }
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
          <div className={styles.noteNameRow}>
            {note.pinned && (
              <Pin className={styles.pinIcon} aria-label="Pinned" />
            )}
            <span className={styles.noteName} title={note.name}>
              {note.name}
            </span>
          </div>
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
        onDelete={handleDelete}
        onArchive={handleArchive}
        onTimeTracking={handleTimeTracking}
        onViewTimeEntries={handleViewTimeEntries}
        onMoveToFolder={handleMoveToFolder}
        onTextToSpeech={handleTextToSpeech}
        onDownloadAudio={handleDownloadAudio}
        onViewAudioHistory={handleViewAudioHistory}
        onViewBoard={handleViewBoard}
        onEdit={handleEdit}
        onLabel={handleLabel}
        onPin={handlePin}
        isPinned={note.pinned}
        onExport={handleExport}
        onImportIntoNote={handleImportIntoNote}
        onConvertToMemo={handleConvertToMemo}
        isMemo={Boolean(note.isMemo)}
        isConverting={isConverting}
        isDownloading={isDownloading}
        audioError={audioError}
        audioCount={audioHistory.length}
      />

      <input
        ref={mergeFileInputRef}
        type="file"
        accept=".chronus"
        style={{ display: 'none' }}
        onChange={handleMergeFileChange}
      />

      {mergeMemo && !isLoadingTimeTracks && (
        <MergeSelectionDialog
          open
          memo={mergeMemo.memo}
          version={mergeMemo.version}
          existingTimeTracks={timeTracks}
          isMerging={isMerging}
          onCancel={() => setMergeMemo(null)}
          onConfirm={handleConfirmMerge}
        />
      )}

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

      <AudioHistoryView
        isOpen={isAudioHistoryOpen}
        onClose={() => setIsAudioHistoryOpen(false)}
        noteId={note.id}
        audios={audioHistory}
        isLoading={isHistoryLoading}
        error={audioError}
        onDownload={handleDownloadAudio}
        isDownloading={isDownloading}
        onDelete={handleDeleteAudio}
        isDeleting={isAudioDeleting}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveDialogOpen} onOpenChange={(open) => !open && setArchiveDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Note?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to archive this note? It will be hidden from
            your main list but can be restored later.
          </p>
          {archiveError && (
            <Alert variant="destructive">
              <AlertDescription>{archiveError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmArchive}
              disabled={isArchiving}
              className="bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning-dark)]"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={convertDialogOpen} onOpenChange={(open) => !open && setConvertDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Convert to Memo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Convert this checklist to a memo note? Your check items will be
            available in the sidebar checklist, and time tracks will be preserved.
          </p>
          {convertError && (
            <Alert variant="destructive">
              <AlertDescription>{convertError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertDialogOpen(false)}
              disabled={isConvertingToMemo}
            >
              Cancel
            </Button>
            <Button onClick={confirmConvertToMemo} disabled={isConvertingToMemo}>
              {isConvertingToMemo ? 'Converting...' : 'Convert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MoveNoteDialog
        open={isMoveDialogOpen}
        onClose={handleMoveDialogClose}
        onConfirm={handleMoveConfirm}
        currentFolderId={note.folderId}
        error={moveError}
      />
    </>
  );
};
