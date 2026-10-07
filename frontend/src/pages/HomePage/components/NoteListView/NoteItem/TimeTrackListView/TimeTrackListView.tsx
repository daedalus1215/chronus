import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { deleteTimeTrack } from '../../../../../../api/requests/time-tracks.requests';
import { useUpdateTimeTrack } from '../../../../hooks/useUpdateTimeTrack/useUpdateTimeTrack';
import {
  TimeTrackingForm,
  TimeTrackingData,
} from '../TimeTrackingForm/TimeTrackingForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Pencil, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './TimeTrackListView.module.css';
import { TimeTrack } from '../../../../hooks/useNoteTimeTracks/useNoteTimeTracks';
import { formatDateForDisplay } from '../../../../../../utils/dateUtils';
import { TimeTrackTotalResponseDto } from '@/api/dtos/note.dtos';

type TimeTrackListProps = {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  timeTracks: TimeTrack[];
  isLoadingTimeTracks: boolean;
  error?: string;
  totalTimeData: TimeTrackTotalResponseDto | null;
  isLoadingTotal: boolean;
};

export const TimeTrackListView: React.FC<TimeTrackListProps> = ({
  isOpen,
  onClose,
  noteId,
  timeTracks,
  isLoadingTimeTracks,
  error,
  totalTimeData,
  isLoadingTotal,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TimeTrack | null>(null);
  const queryClient = useQueryClient();
  const updateMutation = useUpdateTimeTrack(noteId);

  const { mutate: mutateDeleteTimeTrack, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteTimeTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeTracks', noteId] });
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    },
    onError: () => { },
  });

  const handleEditStart = (track: TimeTrack): void => {
    setEditingTrack(track);
    setEditDialogOpen(true);
  };

  const handleEditClose = (): void => {
    setEditDialogOpen(false);
    setEditingTrack(null);
  };

  const handleEditSubmit = async (data: TimeTrackingData): Promise<void> => {
    if (!editingTrack) return;
    await updateMutation.mutateAsync({
      id: editingTrack.id,
      payload: {
        date: data.date,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        note: data.note,
      },
    });
    handleEditClose();
    setEditDialogOpen(false);
    setEditingTrack(null);
  };

  const formatDuration = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const remainingMinutes = minutes % 60;

    if (days > 0) {
      const parts = [`${days}d`];
      if (hours > 0) parts.push(`${hours}h`);
      if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
      return parts.join(' ');
    } else if (hours > 0) {
      const parts = [`${hours}h`];
      if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
      return parts.join(' ');
    }
    return `${remainingMinutes}m`;
  };

  const formatDate = (dateStr: string) => formatDateForDisplay(dateStr);

  if (isLoadingTimeTracks) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Time Entries</h3>
          <div className={styles.loading}>Loading time entries...</div>
        </div>
      </BottomSheet>
    );
  }

  if (error) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.container}>
          <h3 className={styles.title}>Time Entries</h3>
          <div className={styles.error}>{error}</div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Time Entries</h3>
        <div className={styles.totalTimeContainer}>
          {isLoadingTotal ? (
            <div className={styles.loading}>Loading total time...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : totalTimeData ? (
            <div className={styles.totalTime}>
              Total Time: {formatDuration(totalTimeData.totalMinutes)}
            </div>
          ) : null}
        </div>
        {timeTracks.length === 0 ? (
          <div className={styles.empty}>
            <Clock className={styles.emptyIcon} />
            <p>No time entries found</p>
            <p className={styles.emptySubtext}>
              Start a timer to track time spent on this note
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {timeTracks.map(track => (
              <div key={track.id} className={styles.timeTrackItem}>
                <div className={styles.timeTrackHeader}>
                  <div className={styles.timeTrackDate}>
                    {formatDate(track.date)}
                  </div>
                  <div className={styles.timeTrackDuration}>
                    {formatDuration(track.durationMinutes)}
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      aria-label="Edit time entry"
                      onClick={() => handleEditStart(track)}
                      className={styles.editButton}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete time entry"
                      onClick={() => {
                        setDeleteTargetId(track.id);
                        setDeleteDialogOpen(true);
                      }}
                      className={styles.deleteButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.timeTrackTime}>
                  Started at {track.startTime}
                </div>
                {track.note && (
                  <div className={styles.timeTrackNote}>{track.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Time Entry?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this time entry? This action
              cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteTargetId != null) {
                    mutateDeleteTimeTrack(deleteTargetId);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TimeTrackingForm
          isOpen={editDialogOpen}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
          initialData={
            editingTrack
              ? {
                date: editingTrack.date,
                startTime: editingTrack.startTime,
                durationMinutes: editingTrack.durationMinutes,
                note: editingTrack.note,
              }
              : undefined
          }
          isSubmitting={updateMutation.isPending}
          hasPendingTracks={false}
        />
      </div>
    </BottomSheet>
  );
};
