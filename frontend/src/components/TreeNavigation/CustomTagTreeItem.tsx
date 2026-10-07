import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MoreVertical, Pin, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ROUTES } from '../../constants/routes';
import { NOTE_PREFIX, TAG_PREFIX, parseNoteId, getTagTreeItemLabel, type TagTreeItem } from './tagTreeItems';
import { NoteActionsGrid } from '../../pages/HomePage/components/NoteListView/NoteItem/NoteActionGrid/NoteActionGrid';
import { MoveNoteDialog } from '../../components/MoveNoteDialog/MoveNoteDialog';
import { useMoveNoteToFolder } from '../../pages/NotePage/hooks/useMoveNoteToFolder/useMoveNoteToFolder';
import type { FolderDto } from '../../api/dtos/folder.dtos';
import {
  TimeTrackingForm,
  type TimeTrackingData,
} from '../../pages/HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm';
import { TimeTrackListView } from '../../pages/HomePage/components/NoteListView/NoteItem/TimeTrackListView/TimeTrackListView';
import { useNoteTimeTracks } from '../../pages/HomePage/hooks/useNoteTimeTracks/useNoteTimeTracks';
import { useCreateTimeTrack } from '../../pages/HomePage/hooks/useCreateTimeTrack/useCreateTimeTrack';
import {
  deleteNote,
  updateNoteTimestamp,
} from '../../api/requests/notes.requests';
import { useArchiveNote } from '../../pages/HomePage/hooks/useArchiveNote';
import { usePinNote } from '../../pages/HomePage/hooks/usePinNote';
import { TagActionPanel } from '../../pages/TagPage/components/TagListView/TagItem/TagActionPanel/TagActionPanel';
import type { Tag } from '../../api/dtos/tag.dtos';
import styles from './TagTreeNavigation.module.css';

type CustomTagTreeItemProps = {
  item: TagTreeItem;
  isExpanded: boolean;
  pinned?: boolean;
  tagMeta?: { name: string; noteCount: number };
  onClick: () => void;
  onNotePinned?: (noteId: number, tagId: number) => void;
};

/**
 * One row of the tag/note tree (and recursively, its dialogs/menus). Hand-
 * rolled: expand/collapse and selection state live in the parent
 * (TagTreeNavigation); this component owns only a row's own click
 * behavior plus the note/tag action surfaces (⋮ menu, delete/archive
 * confirm, move, time tracking).
 */
export const CustomTagTreeItem: React.FC<CustomTagTreeItemProps> = ({
  item,
  isExpanded,
  pinned: isPinned = false,
  tagMeta,
  onClick,
  onNotePinned,
}) => {
  const itemId = item.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const isNote = itemId.startsWith(NOTE_PREFIX);
  const parsed = parseNoteId(itemId);
  const noteId = parsed?.noteId ?? 0;
  const tagId = parsed?.tagId;
  const tagIdFromItem = itemId.startsWith(TAG_PREFIX)
    ? itemId.slice(TAG_PREFIX.length)
    : '';
  const isTagSelected = Boolean(
    routeTagId && tagIdFromItem && routeTagId === tagIdFromItem
  );

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const [isTimeTrackListOpen, setIsTimeTrackListOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const { archiveNote, isArchiving } = useArchiveNote();
  const { pinNote } = usePinNote();
  const {
    createTimeTrack,
    isCreating,
    error: createTimeTrackError,
  } = useCreateTimeTrack();
  const {
    moveNote,
    error: moveError,
    clearError: clearMoveError,
    snackbarMessage: moveSnackbarMessage,
    closeSnackbar: closeMoveSnackbar,
  } = useMoveNoteToFolder(noteId);
  const {
    timeTracks,
    isLoadingTimeTracks,
    totalTimeData,
    isLoadingTotal,
    timeTrackError,
  } = useNoteTimeTracks(noteId, isTimeTrackListOpen);

  useEffect(() => {
    if (moveSnackbarMessage !== null) {
      toast.success(moveSnackbarMessage);
      closeMoveSnackbar();
    }
  }, [moveSnackbarMessage, closeMoveSnackbar]);

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateNoteTimestamp(noteId)
        .then(() => setIsActionsOpen(true))
        .catch(() => setIsActionsOpen(true));
    },
    [noteId]
  );

  const handleDelete = useCallback(() => {
    setIsActionsOpen(false);
    setDeleteDialogOpen(true);
  }, []);

  const handleArchive = useCallback(() => {
    setIsActionsOpen(false);
    setArchiveDialogOpen(true);
  }, []);
  const handlePin = useCallback(async () => {
    const nextPinned = !isPinned;
    setIsActionsOpen(false);
    try {
      await pinNote(noteId, nextPinned);
      if (tagId != null) {
        onNotePinned?.(noteId, tagId);
      }
    } catch (err) {
      console.error('Failed to update pin state:', err);
      toast.error('Failed to update pin state');
    }
  }, [isPinned, noteId, tagId, pinNote, onNotePinned]);

  const handleTimeTracking = useCallback(() => {
    setIsActionsOpen(false);
    setIsTimeTrackingOpen(true);
  }, []);

  const handleViewTimeEntries = useCallback(() => {
    setIsActionsOpen(false);
    setIsTimeTrackListOpen(true);
  }, []);

  const handleTagMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsActionsOpen(true);
  }, []);

  const handleTimeTrackingSubmit = useCallback(
    async (data: TimeTrackingData) => {
      try {
        await createTimeTrack({
          date: data.date,
          startTime: data.startTime,
          durationMinutes:
            data.durationMinutes === undefined
              ? 1
              : Number(data.durationMinutes),
          noteId,
          note: data.note,
        });
        setIsTimeTrackingOpen(false);
        toast.success('Time track saved successfully');
      } catch {
        toast.error(createTimeTrackError || 'Failed to save time track');
      }
    },
    [noteId, createTimeTrack, createTimeTrackError]
  );

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteNote(noteId);
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      if (tagId != null) {
        navigate(ROUTES.TAG_NOTES(tagId), { replace: true });
      }
    } catch (err: unknown) {
      setIsDeleting(false);
      const message =
        err &&
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? String(
              (err as { response: { data: { message: string } } }).response
                .data.message
            )
          : 'Failed to delete note';
      setDeleteError(message);
    }
  }, [noteId, queryClient, tagId, navigate]);

  const confirmArchive = useCallback(async () => {
    setArchiveError(null);
    try {
      await archiveNote(noteId);
      setArchiveDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      if (tagId != null) {
        navigate(ROUTES.TAG_NOTES(tagId), { replace: true });
      }
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? String(
              (err as { response: { data: { message: string } } }).response
                .data.message
            )
          : 'Failed to archive note';
      setArchiveError(message);
    }
  }, [noteId, archiveNote, queryClient, tagId, navigate]);

  const handleViewBoard = useCallback(() => {
    setIsActionsOpen(false);
    navigate(ROUTES.KANBAN(noteId));
  }, [noteId, navigate]);

  const handleLabel = useCallback(() => {
    setIsActionsOpen(false);
    const base = tagId != null ? ROUTES.TAG_NOTES(tagId) : ROUTES.HOME;
    navigate(`${base}/notes/${noteId}?sidebar=tags`);
  }, [noteId, tagId, navigate]);

  const handleEdit = useCallback(() => {
    setIsActionsOpen(false);
    // Open the note in edit mode; NotePage consumes ?edit=1 and strips it.
    const base = tagId != null ? ROUTES.TAG_NOTES(tagId) : ROUTES.HOME;
    navigate(`${base}/notes/${noteId}?edit=1`);
  }, [noteId, tagId, navigate]);

  const handleMoveToFolder = useCallback(() => {
    clearMoveError();
    setIsActionsOpen(false);
    setIsMoveDialogOpen(true);
  }, [clearMoveError]);

  const handleMoveConfirm = useCallback(
    async (folder: FolderDto | null) => {
      try {
        await moveNote(folder);
        setIsMoveDialogOpen(false);
      } catch {
        // Error is exposed via the hook; the dialog stays open with the
        // message and the user can retry.
      }
    },
    [moveNote]
  );

  const handleMoveDialogClose = useCallback(() => {
    setIsMoveDialogOpen(false);
    clearMoveError();
  }, [clearMoveError]);

  const noop = useCallback(() => setIsActionsOpen(false), []);

  // Tag rows surface the shared tag management panel (edit form, delete
  // dialog, ⋮ grid). The panel needs the full Tag DTO; the tree item only
  // carries name/noteCount, so fetch-backed fields (description) are
  // resolved by the panel's own query when the form opens.
  const tagData: Tag | null =
    !isNote && tagIdFromItem
      ? {
          id: Number(tagIdFromItem),
          name: tagMeta?.name ?? '',
          noteCount: tagMeta?.noteCount ?? 0,
        }
      : null;

  if (item.isLoadingPlaceholder) {
    return <div className={cn(styles.row, 'cursor-default')}>…</div>;
  }

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={isNote ? undefined : isExpanded}
        aria-selected={isTagSelected}
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(styles.row, isTagSelected && styles.rowSelected)}
      >
        {!isNote && <TagIcon className={styles.icon} />}
        {isNote && isPinned && <Pin className={styles.pinIcon} />}
        {isNote ? (
          <span className={styles.noteLabel}>{item.label}</span>
        ) : (
          <span className={styles.tagLabel}>{getTagTreeItemLabel(item)}</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={styles.moreButton}
          onClick={isNote ? handleMoreClick : handleTagMoreClick}
          onPointerDown={e => e.stopPropagation()}
          aria-label="More options"
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>

      {isNote && (
        <>
          <NoteActionsGrid
            isOpen={isActionsOpen}
            onClose={() => setIsActionsOpen(false)}
            onShare={noop}
            onDuplicate={noop}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onTimeTracking={handleTimeTracking}
            onViewTimeEntries={handleViewTimeEntries}
            onMoveToFolder={handleMoveToFolder}
            onTextToSpeech={noop}
            onDownloadAudio={noop}
            onEdit={handleEdit}
            onLabel={handleLabel}
            onPin={handlePin}
            isPinned={isPinned}
            onExport={noop}
            onViewAudioHistory={function (): void {
              throw new Error('Function not implemented.');
            }}
            onViewBoard={handleViewBoard}
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
            noteId={noteId}
            timeTracks={timeTracks}
            isLoadingTimeTracks={isLoadingTimeTracks}
            error={timeTrackError ?? undefined}
            totalTimeData={totalTimeData}
            isLoadingTotal={isLoadingTotal}
          />
          <MoveNoteDialog
            open={isMoveDialogOpen}
            onClose={handleMoveDialogClose}
            onConfirm={handleMoveConfirm}
            error={moveError}
          />
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Note?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this note? This action cannot
                be undone.
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
                Are you sure you want to archive this note? It will be hidden
                from your main list but can be restored later.
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
        </>
      )}

      {tagData && (
        <TagActionPanel
          tag={tagData}
          isOpen={isActionsOpen}
          onClose={() => setIsActionsOpen(false)}
        />
      )}
    </>
  );
};
