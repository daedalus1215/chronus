import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MoreVert from '@mui/icons-material/MoreVert';
import LocalOffer from '@mui/icons-material/LocalOffer';
import { ROUTES } from '../../constants/routes';
import { NOTE_PREFIX, TAG_PREFIX, parseNoteId } from './tagTreeItems';
import { NoteActionsGrid } from '../../pages/HomePage/components/NoteListView/NoteItem/NoteActionGrid/NoteActionGrid';
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

/** Font size to match DesktopNoteListView compact items. */
const LIST_FONT_SIZE = '0.8125rem';

/** Tag (folder) label: same font, size and color as DesktopNoteListView compact .noteName. */
const TAG_LABEL_SX = {
  fontSize: LIST_FONT_SIZE,
  fontWeight: 500,
  color: 'var(--color-text)',
};

/** Nested note label: same size, secondary color to distinguish from tags. */
const NESTED_NOTE_LABEL_COLOR = 'var(--color-text-secondary)';
const NOTE_LABEL_SX = {
  fontSize: LIST_FONT_SIZE,
  color: NESTED_NOTE_LABEL_COLOR,
};

const ICON_CONTAINER_SX = {
  fontSize: 20,
  color: 'var(--color-text-secondary)',
  '& svg': { fontSize: 20 },
};

/** Content row: padding to match compact note list, divider. */
const CONTENT_DIVIDER_SX = {
  padding: '0.375rem 0.5rem',
  borderBottom: '1px solid var(--color-border-light)',
};

/**
 * Custom TreeItem that applies slotProps for nested item styling:
 * - Note items (id starting with "note-"): smaller label font, secondary color, and 3-dots menu (bottom sheet) like NoteItem.
 * - All items: icon container size/color, and a bottom border divider per row.
 */
export const CustomTagTreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  (props, ref) => {
    const { itemId, slotProps = {}, slots = {}, ...rest } = props;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { tagId: routeTagId } = useParams<{ tagId: string }>();
    const isNote = typeof itemId === 'string' && itemId.startsWith(NOTE_PREFIX);
    const parsed = typeof itemId === 'string' ? parseNoteId(itemId) : null;
    const noteId = parsed?.noteId ?? 0;
    const tagId = parsed?.tagId;
    const tagIdFromItem =
      typeof itemId === 'string' && itemId.startsWith(TAG_PREFIX)
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [archiveError, setArchiveError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>(
      'success'
    );

    const { archiveNote, isArchiving } = useArchiveNote();
    const {
      createTimeTrack,
      isCreating,
      error: createTimeTrackError,
    } = useCreateTimeTrack();
    const {
      timeTracks,
      isLoadingTimeTracks,
      totalTimeData,
      isLoadingTotal,
      timeTrackError,
    } = useNoteTimeTracks(noteId, isTimeTrackListOpen);

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

    const handleTimeTracking = useCallback(() => {
      setIsActionsOpen(false);
      setIsTimeTrackingOpen(true);
    }, []);

    const handleViewTimeEntries = useCallback(() => {
      setIsActionsOpen(false);
      setIsTimeTrackListOpen(true);
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
          setToastSeverity('success');
          setToastMessage('Time track saved successfully');
        } catch {
          setToastSeverity('error');
          const errorMessage =
            createTimeTrackError || 'Failed to save time track';
          setToastMessage(errorMessage);
        }
      },
      [noteId, createTimeTrack, createTimeTrackError]
    );

    const handleCloseToast = useCallback(() => {
      setToastMessage(null);
    }, []);

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

    const noop = useCallback(() => setIsActionsOpen(false), []);

    const contentSlot = slotProps.content as { sx?: object } | undefined;
    const labelSlot = slotProps.label as { sx?: object } | undefined;
    const iconSlot = slotProps.iconContainer as { sx?: object } | undefined;

    const CustomNoteLabel = useCallback(
      (labelProps: Record<string, unknown>) => {
        const { ownerState, editable, ...labelPropsForDom } = labelProps;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              minWidth: 0,
            }}
          >
            <Box
              {...labelPropsForDom}
              sx={[
                NOTE_LABEL_SX,
                (labelProps.sx as object) ?? {},
                { flex: 1, minWidth: 0 },
              ]}
            />
            <IconButton
              size="small"
              onClick={handleMoreClick}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="More options"
              sx={{ flexShrink: 0, color: 'var(--color-text-secondary)' }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        );
      },
      [handleMoreClick]
    );

    const tagLabelSx = {
      ...TAG_LABEL_SX,
      ...(isTagSelected ? { color: 'var(--color-primary)' } : {}),
    };
    const tagIconContainerSx = {
      ...ICON_CONTAINER_SX,
      ...(isTagSelected ? { color: 'var(--color-primary)' } : {}),
    };
    const mergedSlotProps = {
      ...slotProps,
      content: {
        ...slotProps.content,
        sx: { ...CONTENT_DIVIDER_SX, ...contentSlot?.sx },
      },
      label: isNote
        ? { ...slotProps.label, sx: { ...NOTE_LABEL_SX, ...labelSlot?.sx } }
        : { ...slotProps.label, sx: { ...tagLabelSx, ...labelSlot?.sx } },
      iconContainer: {
        ...slotProps.iconContainer,
        sx: isNote
          ? { ...ICON_CONTAINER_SX, ...iconSlot?.sx }
          : { ...tagIconContainerSx, ...iconSlot?.sx },
      },
    };

    const mergedSlots = isNote
      ? { ...slots, label: CustomNoteLabel }
      : { ...slots, icon: LocalOffer };

    return (
      <>
        <TreeItem
          ref={ref}
          {...rest}
          itemId={itemId}
          slotProps={mergedSlotProps}
          slots={mergedSlots}
        />
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
              onPin={noop}
              onStar={noop}
              onTextToSpeech={noop}
              onDownloadAudio={noop}
              onEdit={noop}
              onLabel={noop}
              onExport={noop}
              onLock={noop}
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
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              aria-labelledby="tree-note-delete-dialog-title"
            >
              <DialogTitle id="tree-note-delete-dialog-title">
                Delete Note?
              </DialogTitle>
              <DialogContent>
                Are you sure you want to delete this note? This action cannot
                be undone.
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
              aria-labelledby="tree-note-archive-dialog-title"
            >
              <DialogTitle id="tree-note-archive-dialog-title">
                Archive Note?
              </DialogTitle>
              <DialogContent>
                Are you sure you want to archive this note? It will be hidden
                from your main list but can be restored later.
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
          </>
        )}
      </>
    );
  }
);

CustomTagTreeItem.displayName = 'CustomTagTreeItem';
