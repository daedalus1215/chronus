import React, { useState, useEffect } from 'react';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { Box, Typography, TextField, Paper } from '@mui/material';
import { getDailyTimeTracksAggregation } from '../../../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../../../api/dtos/time-tracks.dtos';
import styles from './DailyTimeTracksRadar.module.css';
import { getCurrentDateString } from '../../../../utils/dateUtils';

type Props = {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  data?: TimeTrackAggregationResponse[];
  loading?: boolean;
  showControls?: boolean;
};

export const DailyTimeTracksRadar: React.FC<Props> = ({ 
  selectedDate: externalSelectedDate,
  onDateChange,
  data: externalData,
  loading: externalLoading,
  showControls = false
}) => {
  const [internalData, setInternalData] = useState<TimeTrackAggregationResponse[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(() => {
    return getCurrentDateString();
  });

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

  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!timeTracks.length) return { series: [], metrics: [], maxValue: 0 };

    // Take top 6 notes by daily time for better visualization
    const topNotes = [...timeTracks]
      .filter(note => note.dailyTimeMinutes > 0) // Only show notes with actual daily time
      .sort((a, b) => b.dailyTimeMinutes - a.dailyTimeMinutes)
      .slice(0, 6);

    if (topNotes.length === 0) return { series: [], metrics: [], maxValue: 0 };

    // Note titles become the metrics (axes/spokes)
    const metrics = topNotes.map(note => 
      note.noteName.length > 12 ? note.noteName.substring(0, 12) + '...' : note.noteName
    );

    // Daily time values become the series data
    const dailyTimeData = topNotes.map(note => note.dailyTimeMinutes);
    const maxDailyTime = Math.max(...dailyTimeData);

    // Create series for daily time spent
    const series = [
      {
        label: 'Daily Time (minutes)',
        data: dailyTimeData
      }
    ];

    return { series, metrics, maxValue: Math.ceil(maxDailyTime / 10) * 10 }; // Round up to nearest 10
  };

  const { series, metrics, maxValue } = prepareRadarData();

  const shouldShowControls = showControls || (!externalSelectedDate && !onDateChange);

  return (
    <Paper className={styles.container}>
      <Box className={styles.header}>
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
          </Box>
        )}
      </Box>
      
      {error ? (
        <Box className={styles.error}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : loading ? (
        <Box className={styles.loading}>
          <Typography>Loading time tracks...</Typography>
        </Box>
      ) : series.length === 0 ? (
        <Box className={styles.noData}>
          <Typography color="textSecondary">
            No time tracks found for this date
          </Typography>
        </Box>
      ) : (
        <Box className={styles.chartContainer}>
          <RadarChart
            series={series}
            radar={{
              max: maxValue || 60, // Default to 60 minutes if no max calculated
              metrics: metrics,
            }}
            slotProps={{
              tooltip: { 
                trigger: 'item'
              }
            }}
            sx={{
              '& .MuiChartsLegend-series': {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
}; 