import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import NotesIcon from '@mui/icons-material/Notes';
import { useNavigate } from 'react-router-dom';
import { TimeTrackWithNoteResponse } from '../../../../api/dtos/time-tracks.dtos';
import { ROUTES } from '../../../../constants/routes';
import { deleteTimeTrack, updateTimeTrack } from '../../../../api/requests/time-tracks.requests';
import styles from './TimeEntryDataGrid.module.css';

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

type Props = {
  rows: TimeTrackWithNoteResponse[];
  loading: boolean;
  onRowDeleted: (id: number) => void;
  onRowUpdated: (id: number, updated: TimeTrackWithNoteResponse) => void;
};

type EditField = 'date' | 'startTime' | 'durationMinutes' | 'note';

interface EditDialogState {
  open: boolean;
  row: TimeTrackWithNoteResponse | null;
  field: EditField | null;
  value: string;
}

export const TimeEntryDataGrid: React.FC<Props> = ({
  rows,
  loading,
  onRowDeleted,
  onRowUpdated,
}) => {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement | null;
    rowId: number | null;
  }>({ el: null, rowId: null });
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    row: null,
    field: null,
    value: '',
  });

  const handleDelete = useCallback(
    async (id: number) => {
      onRowDeleted(id);
      try {
        await deleteTimeTrack(id);
      } catch {
        console.error('Failed to delete time track');
      }
    },
    [onRowDeleted]
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number
  ) => {
    setMenuAnchor({ el: event.currentTarget, rowId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ el: null, rowId: null });
  };

  const handleEditClick = (field: EditField) => {
    const row = rows.find((r) => r.id === menuAnchor.rowId);
    if (!row) return;

    let value = '';
    switch (field) {
      case 'date':
        value = row.date;
        break;
      case 'startTime':
        value = row.startTime;
        break;
      case 'durationMinutes':
        value = String(row.durationMinutes);
        break;
      case 'note':
        value = row.note || '';
        break;
    }

    setEditDialog({
      open: true,
      row,
      field,
      value,
    });
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!editDialog.row || !editDialog.field) return;

    const updates: Record<string, unknown> = {};
    switch (editDialog.field) {
      case 'date':
        updates.date = editDialog.value;
        break;
      case 'startTime':
        updates.startTime = editDialog.value;
        break;
      case 'durationMinutes':
        updates.durationMinutes = parseInt(editDialog.value) || 0;
        break;
      case 'note':
        updates.note = editDialog.value;
        break;
    }

    try {
      await updateTimeTrack(editDialog.row.id, updates);
      onRowUpdated(editDialog.row.id, {
        ...editDialog.row,
        ...updates,
      } as TimeTrackWithNoteResponse);
    } catch {
      console.error('Failed to update time track');
    } finally {
      setEditDialog({ open: false, row: null, field: null, value: '' });
    }
  };

  const getEditDialogTitle = () => {
    switch (editDialog.field) {
      case 'date':
        return 'Edit Date';
      case 'startTime':
        return 'Edit Start Time';
      case 'durationMinutes':
        return 'Edit Duration';
      case 'note':
        return 'Edit Note';
      default:
        return 'Edit';
    }
  };

  const getEditDialogInput = () => {
    switch (editDialog.field) {
      case 'date':
        return (
          <TextField
            type="date"
            fullWidth
            value={editDialog.value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
          />
        );
      case 'startTime':
        return (
          <TextField
            type="time"
            fullWidth
            value={editDialog.value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
          />
        );
      case 'durationMinutes':
        return (
          <TextField
            type="number"
            fullWidth
            label="Duration (minutes)"
            value={editDialog.value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
            inputProps={{ min: 1, max: 1440 }}
          />
        );
      case 'note':
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Note"
            value={editDialog.value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
          />
        );
      default:
        return null;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'noteName',
      headerName: 'Note',
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          component="button"
          onClick={() => navigate(ROUTES.NOTE(params.row.noteId))}
          className={styles.noteLink}
          underline="hover"
        >
          {params.value as string}
        </Link>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <span className={styles.cellText}>{params.value as string}</span>
      ),
    },
    {
      field: 'startTime',
      headerName: 'Start',
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <span className={styles.cellText}>{params.value as string}</span>
      ),
    },
    {
      field: 'durationMinutes',
      headerName: 'Duration',
      width: 110,
      valueFormatter: (value: number) => formatDuration(value),
      renderCell: (params: GridRenderCellParams) => (
        <span className={styles.durationCell}>
          {formatDuration(params.value as number)}
        </span>
      ),
    },
    {
      field: 'note',
      headerName: 'Memo',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span className={`${styles.cellText} ${styles.noteText}`}>
          {(params.value as string) || '—'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box className={styles.actionButtons}>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.id as number)}
            className={styles.actionButton}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.id as number)}
            className={styles.actionButton}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const gridRows: GridRowsProp = rows.map((row) => ({
    ...row,
  }));

  return (
    <>
      <Box className={styles.gridContainer}>
        <DataGrid
          rows={gridRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          autoHeight
          disableColumnMenu
          disableRowSelectionOnClick
          columnHeaderHeight={44}
          getRowHeight={() => 'auto'}
          className={styles.dataGrid}
          slots={{
            noRowsOverlay: () => (
              <Box className={styles.emptyState}>
                <Typography className={styles.emptyStateText}>
                  No time tracks for this period.
                  <br />
                  Use the Quick Add section above to add one.
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>

      {/* Edit Menu */}
      <Menu
        anchorEl={menuAnchor.el}
        open={Boolean(menuAnchor.el)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleEditClick('date')}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Date</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditClick('startTime')}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Start Time</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditClick('durationMinutes')}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Duration</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditClick('note')}>
          <ListItemIcon>
            <NotesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Memo</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() =>
          setEditDialog({ open: false, row: null, field: null, value: '' })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{getEditDialogTitle()}</DialogTitle>
        <DialogContent>{getEditDialogInput()}</DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEditDialog({ open: false, row: null, field: null, value: '' })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
