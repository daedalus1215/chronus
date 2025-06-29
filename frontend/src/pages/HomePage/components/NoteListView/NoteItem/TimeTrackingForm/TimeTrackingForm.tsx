import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

type TimeTrackingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimeTrackingData) => void;
  initialData?: TimeTrackingData;
  isSubmitting?: boolean;
  hasPendingTracks: boolean;
}

export type TimeTrackingData = {
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
}

export const TimeTrackingForm: React.FC<TimeTrackingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  hasPendingTracks
}) => {
  const [formData, setFormData] = useState<TimeTrackingData>(initialData || {
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().slice(0, 5),
    durationMinutes: 30,
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Box>
            <h3>Track Time</h3>
            {hasPendingTracks && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have time tracks pending sync. They will be uploaded when you're back online.
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
            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            value={formData.durationMinutes}
            onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            fullWidth
            inputProps={{ step: 15, min: 0 }}
          />
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
