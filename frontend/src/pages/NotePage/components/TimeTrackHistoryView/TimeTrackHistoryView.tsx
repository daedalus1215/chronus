import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TimeTrackingForm,
  TimeTrackingData,
} from '../../../HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm';
import { formatDateForDisplay } from '../../../../utils/dateUtils';
import {
  useNoteTimeTracks,
  TimeTrack,
} from '../../hooks/useNoteTimeTracks/useNoteTimeTracks';
import { useCreateTimeTrack } from '../../hooks/useCreateTimeTrack/useCreateTimeTrack';
import { useDeleteTimeTrack } from '../../hooks/useDeleteTimeTrack/useDeleteTimeTrack';
import { useUpdateTimeTrackNote } from '../../hooks/useUpdateTimeTrackNote/useUpdateTimeTrackNote';
import styles from './TimeTrackHistoryView.module.css';

type ViewMode = 'history' | 'worklog';

type TimeTrackHistoryViewProps = {
  noteId: number;
};

const formatDurationMinutes = (minutes: number): string => {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = minutes % 60;
  if (days > 0) {
    const parts = [`${days}d`];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (remainingMinutes > 0) {
      parts.push(`${remainingMinutes}m`);
    }
    return parts.join(' ');
  }
  if (hours > 0) {
    const parts = [`${hours}h`];
    if (remainingMinutes > 0) {
      parts.push(`${remainingMinutes}m`);
    }
    return parts.join(' ');
  }
  return `${remainingMinutes}m`;
};

const compareTimeTracks = (
  leftTrack: TimeTrack,
  rightTrack: TimeTrack
): number => {
  const leftDate = new Date(
    `${leftTrack.date}T${leftTrack.startTime}`
  ).getTime();
  const rightDate = new Date(
    `${rightTrack.date}T${rightTrack.startTime}`
  ).getTime();
  return rightDate - leftDate;
};

export const TimeTrackHistoryView: React.FC<TimeTrackHistoryViewProps> = ({
  noteId,
}) => {
  const {
    timeTracks,
    isLoadingTimeTracks,
    isLoadingTotal,
    timeTrackError,
    totalTimeData,
  } = useNoteTimeTracks(noteId);
  const createTimeTrackMutation = useCreateTimeTrack(noteId);
  const deleteTimeTrackMutation = useDeleteTimeTrack(noteId);
  const updateNoteMutation = useUpdateTimeTrackNote(noteId);
  const [viewMode, setViewMode] = useState<ViewMode>('history');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timeTrackPendingDelete, setTimeTrackPendingDelete] =
    useState<TimeTrack | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const sortedTimeTracks = useMemo(() => {
    return [...timeTracks].sort(compareTimeTracks);
  }, [timeTracks]);
  const worklogEntries = useMemo(() => {
    return sortedTimeTracks.filter(
      timeTrack => timeTrack.note && timeTrack.note.trim().length > 0
    );
  }, [sortedTimeTracks]);
  const handleViewModeChange = (nextMode: string): void => {
    if (nextMode) {
      setViewMode(nextMode as ViewMode);
    }
  };
  const handleEditStart = (timeTrack: TimeTrack): void => {
    setEditingId(timeTrack.id);
    setEditingText(timeTrack.note ?? '');
  };
  const handleEditCancel = (): void => {
    setEditingId(null);
    setEditingText('');
  };
  const handleEditSave = (timeTrackId: number): void => {
    updateNoteMutation.mutate(
      { id: timeTrackId, note: editingText.trim() },
      {
        onSuccess: () => {
          handleEditCancel();
        },
      }
    );
  };
  const handleAddClick = (): void => {
    setIsAddFormOpen(true);
  };
  const handleAddFormClose = (): void => {
    setIsAddFormOpen(false);
  };
  const handleAddFormSubmit = async (data: TimeTrackingData): Promise<void> => {
    try {
      const durationMinutes = data.durationMinutes ?? 30;
      await createTimeTrackMutation.mutateAsync({
        date: data.date,
        startTime: data.startTime,
        durationMinutes,
        note: data.note,
      });
      setIsAddFormOpen(false);
    } catch {
      // Error state is surfaced via createTimeTrackMutation.isError
    }
  };
  const handleDeleteClick = (timeTrack: TimeTrack): void => {
    setTimeTrackPendingDelete(timeTrack);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteCancel = (): void => {
    setIsDeleteDialogOpen(false);
    setTimeTrackPendingDelete(null);
  };
  const handleDeleteConfirm = (): void => {
    if (!timeTrackPendingDelete) {
      return;
    }
    deleteTimeTrackMutation.mutate(timeTrackPendingDelete.id, {
      onSettled: () => {
        handleDeleteCancel();
      },
    });
  };
  const isLoading = isLoadingTimeTracks || isLoadingTotal;
  return (
    <div className={styles.timeTrackHistoryContainer}>
      <div className={styles.header}>
        <span className={styles.totalTime}>
          {isLoadingTotal
            ? 'Loading total…'
            : totalTimeData
              ? `Total: ${formatDurationMinutes(totalTimeData.totalMinutes)}`
              : 'Total: —'}
        </span>
        <div className="flex items-center gap-1">
          <ToggleGroup
            type="single"
            size="sm"
            value={viewMode}
            onValueChange={handleViewModeChange}
            aria-label="Time track view mode"
            className="[&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-[var(--color-overlay-stronger)]"
          >
            <ToggleGroupItem
              value="history"
              aria-label="History view"
              className="rounded-none border-0 px-2 py-0.5 text-[0.7rem]"
            >
              History
            </ToggleGroupItem>
            <ToggleGroupItem
              value="worklog"
              aria-label="Worklog view"
              className="rounded-none border-0 px-2 py-0.5 text-[0.7rem]"
            >
              Worklog
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Add time entry"
            onClick={handleAddClick}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className={styles.centeredState}>
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {timeTrackError && !isLoading && (
        <Alert variant="destructive" className="m-3">
          <AlertDescription>Failed to load time entries.</AlertDescription>
        </Alert>
      )}
      {createTimeTrackMutation.isError && (
        <Alert variant="destructive" className="mx-3 mt-2">
          <AlertDescription>Failed to save time entry.</AlertDescription>
        </Alert>
      )}
      {viewMode === 'history' &&
        !isLoading &&
        !timeTrackError &&
        sortedTimeTracks.length === 0 && (
          <span className="block px-3 py-4 text-sm text-muted-foreground">
            No time entries for this note.
          </span>
        )}
      {viewMode === 'history' &&
        !isLoading &&
        !timeTrackError &&
        sortedTimeTracks.length > 0 && (
          <ul
            className={`${styles.list} min-h-0 flex-1 list-none overflow-y-auto p-0`}
          >
            {sortedTimeTracks.map(timeTrack => (
              <li
                key={timeTrack.id}
                className="flex items-center gap-2 border-b border-[var(--color-overlay-stronger)] px-3 py-1"
              >
                <div className="flex w-full items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      {formatDateForDisplay(timeTrack.date)}
                    </p>
                    <span className="block text-xs text-muted-foreground">
                      {`${timeTrack.startTime} • ${formatDurationMinutes(timeTrack.durationMinutes)}`}
                    </span>
                    {timeTrack.note && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`${styles.entryNote} text-xs text-muted-foreground`}
                          >
                            {timeTrack.note}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{timeTrack.note}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete time entry"
                    onClick={() => handleDeleteClick(timeTrack)}
                    disabled={deleteTimeTrackMutation.isPending}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      {viewMode === 'worklog' &&
        !isLoading &&
        !timeTrackError &&
        worklogEntries.length === 0 && (
          <span className="block px-3 py-4 text-sm text-muted-foreground">
            No worklog notes yet. Add a note when you log time to build a
            history of what you worked on.
          </span>
        )}
      {viewMode === 'worklog' &&
        !isLoading &&
        !timeTrackError &&
        worklogEntries.length > 0 && (
          <div
            className={`${styles.list} min-h-0 flex-1 overflow-y-auto`}
          >
            {worklogEntries.map(timeTrack => (
              <div key={timeTrack.id} className={styles.worklogEntry}>
                <div className={styles.worklogMeta}>
                  <span className={styles.worklogDate}>
                    {formatDateForDisplay(timeTrack.date)}
                  </span>
                  <span className={styles.worklogDuration}>
                    {`${timeTrack.startTime} • ${formatDurationMinutes(timeTrack.durationMinutes)}`}
                  </span>
                  {editingId !== timeTrack.id && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit note"
                      onClick={() => handleEditStart(timeTrack)}
                      className="ml-auto text-muted-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>
                {editingId === timeTrack.id ? (
                  <div className="mt-1">
                    <Textarea
                      value={editingText}
                      onChange={event => setEditingText(event.target.value)}
                      rows={2}
                      autoFocus
                      className="text-sm"
                    />
                    <div className="mt-1 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditCancel}
                        disabled={updateNoteMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(timeTrack.id)}
                        disabled={updateNoteMutation.isPending}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className={styles.worklogNote}>{timeTrack.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      {viewMode === 'worklog' && updateNoteMutation.isError && (
        <Alert variant="destructive" className="mx-3 mb-2">
          <AlertDescription>Failed to update note.</AlertDescription>
        </Alert>
      )}
      <div className="shrink-0 border-t border-[var(--color-overlay-stronger)] px-3 py-2"></div>
      <TimeTrackingForm
        isOpen={isAddFormOpen}
        onClose={handleAddFormClose}
        onSubmit={handleAddFormSubmit}
        isSubmitting={createTimeTrackMutation.isPending}
        hasPendingTracks={false}
      />
      <Dialog open={isDeleteDialogOpen} onOpenChange={open => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete time entry?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {timeTrackPendingDelete
              ? `Delete the entry from ${formatDateForDisplay(timeTrackPendingDelete.date)}?`
              : 'Delete this time entry?'}
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleDeleteCancel}
              disabled={deleteTimeTrackMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTimeTrackMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
