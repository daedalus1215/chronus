import React, { useState } from "react";
import { BottomSheet } from "../../../../../../components/BottomSheet/BottomSheet";
import {
  deleteTimeTrack,
} from "../../../../../../api/time-tracks";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Button,
  DialogContent,
  DialogActions,
  Dialog,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./TimeTrackListView.module.css";
import { TimeTrack } from "../../../../hooks/useNoteTimeTracks/useNoteTimeTracks";


type TimeTrackListProps = {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  timeTracks: TimeTrack[];
  isLoadingTimeTracks: boolean;
  error?: string;
  totalTimeData: number;
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
  const queryClient = useQueryClient();

  const { mutate: mutateDeleteTimeTrack, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteTimeTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeTracks", noteId] });
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    },
    onError: () => {},
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

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
          ) : totalTimeData !== null ? (
            <div className={styles.totalTime}>
              Total Time: {formatDuration(totalTimeData)}
            </div>
          ) : null}
        </div>
        {timeTracks.length === 0 ? (
          <div className={styles.empty}>No time entries found</div>
        ) : (
          <div className={styles.list}>
            {timeTracks.map((track) => (
              <div key={track.id} className={styles.timeTrackItem}>
                <div className={styles.timeTrackHeader}>
                  <div className={styles.timeTrackDate}>
                    {formatDate(track.date)}
                  </div>
                  <div className={styles.timeTrackDuration}>
                    {formatDuration(track.durationMinutes)}
                  </div>
                  <IconButton
                    aria-label="Delete time entry"
                    size="small"
                    onClick={() => {
                      setDeleteTargetId(track.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
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
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-time-track-dialog-title"
        >
          <DialogTitle id="delete-time-track-dialog-title">
            Delete Time Entry?
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete this time entry? This action cannot
            be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (deleteTargetId != null) {
                  mutateDeleteTimeTrack(deleteTargetId);
                }
              }}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </BottomSheet>
  );
};
