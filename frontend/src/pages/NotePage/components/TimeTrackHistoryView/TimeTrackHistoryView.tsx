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
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlined from '@mui/icons-material/EditOutlined';
import {
  TimeTrackingForm,
  TimeTrackingData,
} from '../../../HomePage/components/NoteListView/NoteItem/TimeTrackingForm/TimeTrackingForm';
import { formatDateForDisplay } from '../../../../utils/dateUtils';
import { useNoteTimeTracks, TimeTrack } from '../../hooks/useNoteTimeTracks/useNoteTimeTracks';
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
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextMode: ViewMode | null
  ): void => {
    if (nextMode) {
      setViewMode(nextMode);
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
    <Box className={styles.timeTrackHistoryContainer}>
      <Box className={styles.header}>
        <Typography variant="body2" className={styles.totalTime}>
          {isLoadingTotal
            ? 'Loading total…'
            : totalTimeData
              ? `Total: ${formatDurationMinutes(totalTimeData.totalMinutes)}`
              : 'Total: —'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={handleViewModeChange}
            aria-label="Time track view mode"
            sx={{
              '& .MuiToggleButton-root': {
                py: 0.25,
                px: 1,
                fontSize: '0.7rem',
                textTransform: 'none',
                lineHeight: 1.4,
              },
            }}
          >
            <ToggleButton value="history" aria-label="History view">
              History
            </ToggleButton>
            <ToggleButton value="worklog" aria-label="Worklog view">
              Worklog
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton
            size="small"
            aria-label="Add time entry"
            onClick={handleAddClick}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
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
      {viewMode === 'history' &&
        !isLoading &&
        !timeTrackError &&
        sortedTimeTracks.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1.5, py: 2 }}
          >
            No time entries for this note.
          </Typography>
        )}
      {viewMode === 'history' && !isLoading && !timeTrackError && sortedTimeTracks.length > 0 && (
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
      {viewMode === 'worklog' &&
        !isLoading &&
        !timeTrackError &&
        worklogEntries.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1.5, py: 2 }}
          >
            No worklog notes yet. Add a note when you log time to build a
            history of what you worked on.
          </Typography>
        )}
      {viewMode === 'worklog' &&
        !isLoading &&
        !timeTrackError &&
        worklogEntries.length > 0 && (
          <Box
            sx={{
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {worklogEntries.map(timeTrack => (
              <Box
                key={timeTrack.id}
                className={styles.worklogEntry}
              >
                <Box className={styles.worklogMeta}>
                  <Typography component="span" className={styles.worklogDate}>
                    {formatDateForDisplay(timeTrack.date)}
                  </Typography>
                  <Typography
                    component="span"
                    className={styles.worklogDuration}
                  >
                    {`${timeTrack.startTime} • ${formatDurationMinutes(timeTrack.durationMinutes)}`}
                  </Typography>
                  {editingId !== timeTrack.id && (
                    <IconButton
                      size="small"
                      aria-label="Edit note"
                      onClick={() => handleEditStart(timeTrack)}
                      sx={{ ml: 'auto', color: 'text.secondary', p: 0.25 }}
                    >
                      <EditOutlined sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}
                </Box>
                {editingId === timeTrack.id ? (
                  <Box sx={{ mt: 0.5 }}>
                    <TextField
                      value={editingText}
                      onChange={event => setEditingText(event.target.value)}
                      multiline
                      minRows={2}
                      fullWidth
                      size="small"
                      autoFocus
                      sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Button
                        size="small"
                        onClick={handleEditCancel}
                        disabled={updateNoteMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEditSave(timeTrack.id)}
                        disabled={updateNoteMutation.isPending}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography className={styles.worklogNote}>
                    {timeTrack.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      {viewMode === 'worklog' && updateNoteMutation.isError && (
        <Alert severity="error" sx={{ mx: 1.5, mb: 1 }}>
          Failed to update note.
        </Alert>
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
