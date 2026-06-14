import React, { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import {
  TimeTrackingForm,
  TimeTrackingData,
} from '../../../HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm';
import { formatDateForDisplay } from '../../../../utils/dateUtils';
import { useNoteTimeTracks, TimeTrack } from '../../hooks/useNoteTimeTracks/useNoteTimeTracks';
import { useCreateTimeTrack } from '../../hooks/useCreateTimeTrack/useCreateTimeTrack';
import { useDeleteTimeTrack } from '../../hooks/useDeleteTimeTrack/useDeleteTimeTrack';
import styles from './TimeTrackHistoryView.module.css';

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

const compareTimeTracks = (leftTrack: TimeTrack, rightTrack: TimeTrack): number => {
  const leftDate = new Date(`${leftTrack.date}T${leftTrack.startTime}`).getTime();
  const rightDate = new Date(`${rightTrack.date}T${rightTrack.startTime}`).getTime();
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timeTrackPendingDelete, setTimeTrackPendingDelete] =
    useState<TimeTrack | null>(null);
  const sortedTimeTracks = useMemo(() => {
    return [...timeTracks].sort(compareTimeTracks);
  }, [timeTracks]);
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
    <Box className={styles.timeTrackHistoryContainer}>
      <Box className={styles.header}>
        <Typography variant="body2" className={styles.totalTime}>
          {isLoadingTotal
            ? 'Loading total…'
            : totalTimeData
              ? `Total: ${formatDurationMinutes(totalTimeData.totalMinutes)}`
              : 'Total: —'}
        </Typography>
        <IconButton
          size="small"
          aria-label="Add time entry"
          onClick={handleAddClick}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      {isLoading && (
        <Box className={styles.centeredState}>
          <CircularProgress size={20} />
        </Box>
      )}
      {timeTrackError && !isLoading && (
        <Alert severity="error" sx={{ m: 1.5 }}>
          Failed to load time entries.
        </Alert>
      )}
      {createTimeTrackMutation.isError && (
        <Alert severity="error" sx={{ mx: 1.5, mt: 1 }}>
          Failed to save time entry.
        </Alert>
      )}
      {!isLoading && !timeTrackError && sortedTimeTracks.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 1.5, py: 2 }}
        >
          No time entries for this note.
        </Typography>
      )}
      {!isLoading && !timeTrackError && sortedTimeTracks.length > 0 && (
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
          {sortedTimeTracks.map(timeTrack => (
            <ListItem
              key={timeTrack.id}
              disablePadding
              sx={{
                py: 0.5,
                px: 1.5,
                alignItems: 'center',
                borderBottom: '1px solid var(--color-overlay-stronger)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <ListItemText
                  primary={formatDateForDisplay(timeTrack.date)}
                  secondary={
                    <>
                      <Box component="span" sx={{ display: 'block' }}>
                        {`${timeTrack.startTime} • ${formatDurationMinutes(timeTrack.durationMinutes)}`}
                      </Box>
                      {timeTrack.note && (
                        <Tooltip title={timeTrack.note}>
                          <Box
                            component="span"
                            className={styles.entryNote}
                            sx={{ display: 'block', fontSize: '0.75rem' }}
                          >
                            {timeTrack.note}
                          </Box>
                        </Tooltip>
                      )}
                    </>
                  }
                  sx={{
                    my: 0,
                    '& .MuiListItemText-primary': { fontSize: '0.875rem' },
                    '& .MuiListItemText-secondary': { fontSize: '0.75rem' },
                  }}
                />
                <IconButton
                  size="small"
                  aria-label="Delete time entry"
                  onClick={() => handleDeleteClick(timeTrack)}
                  disabled={deleteTimeTrackMutation.isPending}
                  sx={{ color: 'text.secondary' }}
                >
                  <DeleteOutlineRounded fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTop: '1px solid var(--color-overlay-stronger)',
          flexShrink: 0,
        }}
      >
      </Box>
      <TimeTrackingForm
        isOpen={isAddFormOpen}
        onClose={handleAddFormClose}
        onSubmit={handleAddFormSubmit}
        isSubmitting={createTimeTrackMutation.isPending}
        hasPendingTracks={false}
      />
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete time entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {timeTrackPendingDelete
              ? `Delete the entry from ${formatDateForDisplay(timeTrackPendingDelete.date)}?`
              : 'Delete this time entry?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleteTimeTrackMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteTimeTrackMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
