import React, { useMemo } from 'react';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import styles from './DateRangePicker.module.css';

const PRESETS = [
  { label: 'Today', days: 1 },
  { label: '3d', days: 3 },
  { label: '5d', days: 5 },
  { label: '7d', days: 7 },
];

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

function getToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

type Props = {
  from: string;
  to: string;
  onPreset: (days: number) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export const DateRangePicker: React.FC<Props> = ({
  from,
  to,
  onPreset,
  onFromChange,
  onToChange,
}) => {
  const activePreset = useMemo(() => {
    for (const p of PRESETS) {
      if (from === getDaysAgo(p.days - 1) && to === getToday()) {
        return p.days;
      }
    }
    return null;
  }, [from, to]);

  return (
    <Paper className={styles.container} elevation={0}>
      <Box className={styles.header}>
        <CalendarTodayIcon className={styles.icon} />
        <Typography className={styles.title}>Date Range</Typography>
      </Box>

      <Box className={styles.content}>
        <Box className={styles.presets}>
          {PRESETS.map(p => (
            <Button
              key={p.days}
              size="small"
              variant={activePreset === p.days ? 'contained' : 'outlined'}
              onClick={() => onPreset(p.days)}
              className={`${styles.presetButton} ${
                activePreset === p.days ? styles.presetButtonActive : ''
              }`}
            >
              {p.label}
            </Button>
          ))}
        </Box>

        <Box className={styles.divider} />

        <Box className={styles.customRange}>
          <TextField
            type="date"
            label="From"
            value={from}
            onChange={e => onFromChange(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            className={styles.dateField}
          />
          <span className={styles.rangeSeparator}>to</span>
          <TextField
            type="date"
            label="To"
            value={to}
            onChange={e => onToChange(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            className={styles.dateField}
          />
        </Box>
      </Box>
    </Paper>
  );
};
