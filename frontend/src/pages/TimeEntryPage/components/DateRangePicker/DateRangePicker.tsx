import React, { useMemo } from 'react';
import { Box, Button, TextField } from '@mui/material';
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
    <Box className={styles.container}>
      <Box className={styles.presets}>
        {PRESETS.map(p => (
          <Button
            key={p.days}
            size="small"
            variant={activePreset === p.days ? 'contained' : 'outlined'}
            onClick={() => onPreset(p.days)}
          >
            {p.label}
          </Button>
        ))}
      </Box>
      <Box className={styles.customRange}>
        <TextField
          type="date"
          label="From"
          value={from}
          onChange={e => onFromChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
        <TextField
          type="date"
          label="To"
          value={to}
          onChange={e => onToChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
      </Box>
    </Box>
  );
};
