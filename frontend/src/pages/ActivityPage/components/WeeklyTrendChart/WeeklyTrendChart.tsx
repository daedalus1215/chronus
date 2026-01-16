import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { WeeklyTrendResponseDto } from '../../../../api/dtos/weekly-trend.dtos';
import styles from './WeeklyTrendChart.module.css';

type Props = {
  data: WeeklyTrendResponseDto | null;
  loading: boolean;
};

const formatDayLabel = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

export const WeeklyTrendChart: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <Paper className={styles.container}>
        <Typography variant="h6">Weekly Trend</Typography>
        <Box className={styles.loading}>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!data || data.trend.length === 0) {
    return (
      <Paper className={styles.container}>
        <Typography variant="h6">Weekly Trend</Typography>
        <Box className={styles.noData}>
          <Typography color="textSecondary">No data available</Typography>
        </Box>
      </Paper>
    );
  }

  const xAxisData = data.trend.map((day) => formatDayLabel(day.date));
  const seriesData = data.trend.map((day) => day.totalMinutes);

  return (
    <Paper className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6">Weekly Trend</Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Total: {formatTime(data.weeklyTotal)}
        </Typography>
      </Box>
      <Box className={styles.chartContainer}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: xAxisData,
            },
          ]}
          series={[
            {
              data: seriesData,
              label: 'Minutes',
              color: '#6366f1',
              valueFormatter: (value) => formatTime(value || 0),
            },
          ]}
          height={250}
          margin={{ top: 20, bottom: 30, left: 50, right: 20 }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </Box>
    </Paper>
  );
};
