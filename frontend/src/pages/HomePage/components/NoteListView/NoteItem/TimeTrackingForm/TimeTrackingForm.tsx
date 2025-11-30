import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { FormControl } from '@mui/material';
import { Stack, Chip } from '@mui/material';
import {
  getCurrentDateString,
  getCurrentTimeString,
} from '../../../../../../utils/dateUtils';

type TimeTrackingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimeTrackingData) => void;
  initialData?: TimeTrackingData;
  isSubmitting?: boolean;
  hasPendingTracks: boolean;
};

export type TimeTrackingData = {
  date: string;
  startTime: string;
  durationMinutes?: number;
  note?: string;
};

export const TimeTrackingForm: React.FC<TimeTrackingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  hasPendingTracks,
}) => {
  const [formData, setFormData] = useState<TimeTrackingData>(
    initialData || {
      date: getCurrentDateString(),
      startTime: getCurrentTimeString(),
      durationMinutes: 30,
      note: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const quickDurations = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '1h 30m', value: 90 },
    { label: '2h', value: 120 },
  ];

  const [customMode, setCustomMode] = useState(false);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Box>
            <h3>Track Time</h3>
            {hasPendingTracks && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have time tracks pending sync. They will be uploaded when
                you're back online.
              </Alert>
            )}
          </Box>
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Time"
            type="time"
            value={formData.startTime}
            onChange={e =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth size="small"></FormControl>
          <Stack direction="row" spacing={1}>
            {quickDurations.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                color={
                  formData.durationMinutes === opt.value && !customMode
                    ? 'primary'
                    : 'default'
                }
                onClick={() => {
                  setCustomMode(false);
                  setFormData({ ...formData, durationMinutes: opt.value });
                }}
                clickable
              />
            ))}
            <Chip
              label="Custom"
              color={customMode ? 'primary' : 'default'}
              onClick={() => setCustomMode(true)}
              clickable
              aria-label="Enter custom duration"
            />
          </Stack>
          {customMode && (
            <TextField
              label="Custom duration (minutes)"
              type="number"
              value={formData.durationMinutes || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  durationMinutes:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              inputProps={{ min: 1, max: 1440, step: 1 }}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            />
          )}
          <TextField
            label="Note (optional)"
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="button"
              onClick={onClose}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </BottomSheet>
  );
};
