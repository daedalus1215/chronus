import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import {
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  getDateString,
  getTimeString,
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

const DEFAULT_DURATION = 30;
const DEBOUNCE_MS = 500;

const buildBackdatedDefaults = (
  anchor: Date,
  durationMinutes: number
): Omit<TimeTrackingData, 'note'> => {
  const calc = new Date(anchor.getTime() - durationMinutes * 60 * 1000);
  return {
    date: getDateString(calc),
    startTime: getTimeString(calc),
    durationMinutes,
  };
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
      date: '',
      startTime: '',
      durationMinutes: DEFAULT_DURATION,
      note: '',
    }
  );

  const [anchorNow, setAnchorNow] = useState<Date | null>(null);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quickDurations = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '1h 30m', value: 90 },
    { label: '2h', value: 120 },
    { label: '2h 30m', value: 150 },
    { label: '3h', value: 180 },
  ];

  const [customMode, setCustomMode] = useState(false);

  /* ── Modal open: capture anchor, backdate start time ── */
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Caller-provided data → Manual mode, no auto-recalc
        setFormData({
          date: initialData.date,
          startTime: initialData.startTime,
          durationMinutes: initialData.durationMinutes ?? DEFAULT_DURATION,
          note: initialData.note ?? '',
        });
        setAnchorNow(null);
        setAutoMode(false);
      } else {
        const now = new Date();
        setAnchorNow(now);
        setAutoMode(true);
        const backdated = buildBackdatedDefaults(now, DEFAULT_DURATION);
        setFormData({
          ...backdated,
          note: '',
        });
        setCustomMode(false);
      }
    }
  }, [isOpen]);

  /* ── Modal close: reset anchor so next open gets a fresh one ── */
  useEffect(() => {
    if (!isOpen) {
      setAnchorNow(null);
    }
  }, [isOpen]);

  /* ── Cleanup debounce timer on unmount / modal close ── */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  /* ── Duration change handler ── */
  const handleDurationChange = (minutes: number) => {
    setFormData(prev => ({ ...prev, durationMinutes: minutes }));

    if (autoMode && anchorNow) {
      const calc = new Date(anchorNow.getTime() - minutes * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        date: getDateString(calc),
        startTime: getTimeString(calc),
      }));
    }
  };

  /* ── Reset to now ── */
  const handleResetToNow = () => {
    const now = new Date();
    setAnchorNow(now);
    setAutoMode(true);
    const dur = formData.durationMinutes ?? DEFAULT_DURATION;
    const calc = new Date(now.getTime() - dur * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      date: getDateString(calc),
      startTime: getTimeString(calc),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="time-tracking-dialog-title"
    >
      <DialogTitle id="time-tracking-dialog-title">Track Time</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {hasPendingTracks && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have time tracks pending sync. They will be uploaded when
                you're back online.
              </Alert>
            )}
            {!autoMode && (
              <Typography
                component="span"
                color="primary"
                sx={{
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block',
                }}
                onClick={handleResetToNow}
              >
                Reset to now
              </Typography>
            )}
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={e => {
                setAutoMode(false);
                setFormData({ ...formData, date: e.target.value });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={e => {
                setAutoMode(false);
                setFormData({ ...formData, startTime: e.target.value });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small"></FormControl>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="space-evenly"
            >
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
                    handleDurationChange(opt.value);
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
                value={formData.durationMinutes ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  const minutes = raw === '' ? undefined : Number(raw);

                  // Clear previous debounce
                  if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                    debounceTimerRef.current = null;
                  }

                  if (raw === '' || (minutes !== undefined && isNaN(minutes))) {
                    setFormData({ ...formData, durationMinutes: undefined });
                    return;
                  }

                  // Update form immediately so the field reflects keystrokes
                  setFormData({ ...formData, durationMinutes: minutes });

                  if (minutes !== undefined && !isNaN(minutes)) {
                    // Start debounce timer for auto-recalculation
                    debounceTimerRef.current = setTimeout(() => {
                      handleDurationChange(minutes);
                    }, DEBOUNCE_MS);
                  }
                }}
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
                onClick={handleClose}
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
      </DialogContent>
    </Dialog>
  );
};
