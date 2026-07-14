import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TimerIcon from '@mui/icons-material/Timer';
import styles from './SummaryStats.module.css';

interface SummaryStatsProps {
  totalMinutes: number;
  entryCount: number;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  totalMinutes,
  entryCount,
}) => {
  const averageMinutes =
    entryCount > 0 ? Math.round(totalMinutes / entryCount) : 0;

  const stats = [
    {
      icon: <AccessTimeIcon className={styles.icon} />,
      label: 'Total Time',
      value: formatDuration(totalMinutes),
    },
    {
      icon: <FormatListNumberedIcon className={styles.icon} />,
      label: 'Entries',
      value: entryCount.toString(),
    },
    {
      icon: <TimerIcon className={styles.icon} />,
      label: 'Average',
      value: formatDuration(averageMinutes),
    },
  ];

  return (
    <Box className={styles.container}>
      {stats.map(stat => (
        <Paper key={stat.label} className={styles.card}>
          <Box className={styles.iconWrapper}>{stat.icon}</Box>
          <Box className={styles.content}>
            <Typography className={styles.label}>{stat.label}</Typography>
            <Typography className={styles.value}>{stat.value}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
