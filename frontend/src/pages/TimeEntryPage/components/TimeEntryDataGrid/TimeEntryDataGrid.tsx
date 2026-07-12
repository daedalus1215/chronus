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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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

type EditingRow = { id: number; field: string; value: string };

export const TimeEntryDataGrid: React.FC<Props> = ({
  rows,
  loading,
  onRowDeleted,
  onRowUpdated,
}) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState<EditingRow | null>(null);

  const handleDelete = useCallback(
    async (id: number) => {
      // Optimistic delete
      onRowDeleted(id);
      try {
        await deleteTimeTrack(id);
      } catch {
        // On failure, the parent can revert if needed
        console.error('Failed to delete time track');
      }
    },
    [onRowDeleted]
  );

  const handleSaveEdit = useCallback(
    async (row: TimeTrackWithNoteResponse, field: string, value: string) => {
      setEditing(null);
      const updates: Record<string, unknown> = {};
      switch (field) {
        case 'date':
          updates.date = value;
          break;
        case 'startTime':
          updates.startTime = value;
          break;
        case 'durationMinutes':
          updates.durationMinutes = parseInt(value) || 0;
          break;
        case 'note':
          updates.note = value;
          break;
      }
      try {
        await updateTimeTrack(row.id, updates);
        // Reconstruct full response for the parent
        onRowUpdated(row.id, {
          ...row,
          ...updates,
          noteName: row.noteName,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        } as TimeTrackWithNoteResponse);
      } catch {
        console.error('Failed to update time track');
      }
    },
    [onRowUpdated]
  );

  const columns: GridColDef[] = [
    {
      field: 'noteName',
      headerName: 'Note',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          component="button"
          onClick={() => navigate(ROUTES.NOTE(params.row.noteId))}
          sx={{ color: 'primary.main', textDecoration: 'none' }}
          underline="hover"
        >
          {params.value as string}
        </Link>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 130,
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (editing?.id === params.id && editing?.field === 'date') {
          return (
            <Box className={styles.editCell}>
              <TextField
                type="date"
                size="small"
                value={editing.value}
                onChange={e =>
                  setEditing({ ...editing, value: e.target.value })
                }
                sx={{ width: 120 }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleSaveEdit(params.row, 'date', editing.value)
                }
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setEditing(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        return <span>{params.value as string}</span>;
      },
    },
    {
      field: 'startTime',
      headerName: 'Start',
      width: 100,
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (editing?.id === params.id && editing?.field === 'startTime') {
          return (
            <Box className={styles.editCell}>
              <TextField
                type="time"
                size="small"
                value={editing.value}
                onChange={e =>
                  setEditing({ ...editing, value: e.target.value })
                }
                sx={{ width: 90 }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleSaveEdit(params.row, 'startTime', editing.value)
                }
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setEditing(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        return <span>{params.value as string}</span>;
      },
    },
    {
      field: 'durationMinutes',
      headerName: 'Duration',
      width: 110,
      editable: true,
      valueFormatter: (value: number) => formatDuration(value),
      renderCell: (params: GridRenderCellParams) => {
        if (editing?.id === params.id && editing?.field === 'durationMinutes') {
          return (
            <Box className={styles.editCell}>
              <TextField
                type="number"
                size="small"
                value={editing.value}
                onChange={e =>
                  setEditing({ ...editing, value: e.target.value })
                }
                inputProps={{ min: 1, max: 1440 }}
                sx={{ width: 70 }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleSaveEdit(
                    params.row,
                    'durationMinutes',
                    editing.value
                  )
                }
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setEditing(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        return <span>{formatDuration(params.value as number)}</span>;
      },
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 0.5,
      minWidth: 120,
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (editing?.id === params.id && editing?.field === 'note') {
          return (
            <Box className={styles.editCell}>
              <TextField
                size="small"
                value={editing.value}
                onChange={e =>
                  setEditing({ ...editing, value: e.target.value })
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleSaveEdit(params.row, 'note', editing.value)
                }
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setEditing(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        return <span>{(params.value as string) || ''}</span>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box className={styles.actionButtons}>
          {(['date', 'startTime', 'durationMinutes', 'note'] as const).map(
            field => (
              <IconButton
                key={field}
                size="small"
                onClick={() => {
                  let value: string;
                  switch (field) {
                    case 'date':
                      value = params.row.date;
                      break;
                    case 'startTime':
                      value = params.row.startTime;
                      break;
                    case 'durationMinutes':
                      value = String(params.row.durationMinutes);
                      break;
                    case 'note':
                      value = params.row.note || '';
                      break;
                  }
                  setEditing({
                    id: params.id as number,
                    field,
                    value,
                  });
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )
          )}
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.id as number)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const gridRows: GridRowsProp = rows.map(row => ({
    ...row,
  }));

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
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
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            letterSpacing: '0.02em',
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography color="text.secondary">
                No time tracks for this period. Use the row above to add one.
              </Typography>
            </Box>
          ),
        }}
      />
    </Box>
  );
};
