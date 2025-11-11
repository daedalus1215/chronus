import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDailyTimeTracksAggregation } from '../../../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../../../api/dtos/time-tracks.dtos';
import { ROUTES } from '../../../../constants/routes';
import styles from './DailyTimeTracksDataGrid.module.css';
import { getCurrentDateString } from '../../../../utils/dateUtils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDate = (dateString: string): string => {
  // Parse the date string as local date to avoid timezone shifts
  // Assuming the dateString is in YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

type Props = {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  data?: TimeTrackAggregationResponse[];
  loading?: boolean;
};

export const DailyTimeTracksDataGrid: React.FC<Props> = ({ 
  selectedDate: externalSelectedDate,
  onDateChange,
  data: externalData,
  loading: externalLoading 
}) => {
  const [internalData, setInternalData] = useState<TimeTrackAggregationResponse[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(() => {
    return getCurrentDateString();
  });
  const navigate = useNavigate();

  // Use external data if provided, otherwise use internal state
  const timeTracks = externalData || internalData;
  const loading = externalLoading || internalLoading;
  const selectedDate = externalSelectedDate || internalSelectedDate;

  const fetchTimeTracks = async (date?: string) => {
    if (externalData) return; // Don't fetch if external data is provided
    
    setInternalLoading(true);
    setError(null);
    try {
      const data = await getDailyTimeTracksAggregation(date);
      setInternalData(data);
    } catch (err) {
      setError('Failed to load time tracks');
      console.error('Error fetching time tracks:', err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!externalData) {
      fetchTimeTracks(selectedDate);
    }
  }, [selectedDate, externalData]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      setInternalSelectedDate(newDate);
    }
  };

  const handleTodayClick = () => {
    const todayDate = getCurrentDateString();
    if (onDateChange) {
      onDateChange(todayDate);
    } else {
      setInternalSelectedDate(todayDate);
    }
  };

  const handleRowClick = (params: GridRowParams) => {
    const noteId = params.row.id;
    navigate(ROUTES.NOTE(noteId));
  };

  const columns: GridColDef[] = [
    {
      field: 'noteName',
      headerName: 'Note',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'dailyTimeMinutes',
      headerName: 'Daily Time',
      width: 120,
      valueFormatter: (value: number) => formatTime(value),
    },
    {
      field: 'totalTimeMinutes',
      headerName: 'Total Time',
      width: 120,
      valueFormatter: (value: number) => formatTime(value),
    },
    {
      field: 'mostRecentDate',
      headerName: 'Last Activity',
      width: 140,
      valueFormatter: (value: string) => formatDate(value),
    },
  ];

  const rows: GridRowsProp = timeTracks.map((track) => ({
    id: track.noteId,
    noteName: track.noteName,
    dailyTimeMinutes: track.dailyTimeMinutes,
    totalTimeMinutes: track.totalTimeMinutes,
    mostRecentDate: track.mostRecentDate,
  }));

  const shouldShowControls = !externalSelectedDate && !onDateChange;

  return (
    <Paper className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Daily Time Tracks
        </Typography>
        {shouldShowControls && (
          <Box className={styles.dateControls}>
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Button
              variant="contained"
              onClick={handleTodayClick}
              size="small"
              sx={{ minWidth: 70 }}
            >
              Today
            </Button>
          </Box>
        )}
      </Box>
      
      {error ? (
        <Box className={styles.error}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            onRowClick={handleRowClick}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f3f4f6',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.08)', // Primary color with 8% opacity
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
                  <Typography color="textSecondary">
                    No time tracks found for {formatDate(selectedDate)}
                  </Typography>
                </Box>
              ),
            }}
          />
        </Box>
      )}
    </Paper>
  );
}; 