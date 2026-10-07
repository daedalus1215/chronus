import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  /* ── Auto-resize the note textarea as the user types (same pattern as the note
       editor), capped at 40vh: past the cap it scrolls internally so the dialog
       stays compact and the Save button remains in view ── */
  useEffect(() => {
    const textarea = noteTextareaRef.current;
    if (textarea) {
      const maxHeight = window.innerHeight * 0.4;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [formData.note, isOpen]);

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
    <Dialog open={isOpen} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Track Time</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-2"
        >
          {hasPendingTracks && (
            <Alert>
              <AlertDescription>
                You have time tracks pending sync. They will be uploaded when
                you're back online.
              </AlertDescription>
            </Alert>
          )}
          {!autoMode && (
            <button
              type="button"
              className="block border-0 bg-transparent p-0 text-xs text-primary"
              onClick={handleResetToNow}
            >
              Reset to now
            </button>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="time-tracking-date">Date</Label>
            <Input
              id="time-tracking-date"
              type="date"
              value={formData.date}
              onChange={e => {
                setAutoMode(false);
                setFormData({ ...formData, date: e.target.value });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time-tracking-start">Start Time</Label>
            <Input
              id="time-tracking-start"
              type="time"
              value={formData.startTime}
              onChange={e => {
                setAutoMode(false);
                setFormData({ ...formData, startTime: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-wrap justify-evenly gap-2">
            {quickDurations.map(opt => (
              <Badge
                key={opt.value}
                variant={
                  formData.durationMinutes === opt.value && !customMode
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer"
                onClick={() => {
                  setCustomMode(false);
                  handleDurationChange(opt.value);
                }}
              >
                {opt.label}
              </Badge>
            ))}
            <Badge
              variant={customMode ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCustomMode(true)}
              aria-label="Enter custom duration"
            >
              Custom
            </Badge>
          </div>
          {customMode && (
            <div className="space-y-1.5">
              <Label htmlFor="time-tracking-custom-duration">
                Custom duration (minutes)
              </Label>
              <Input
                id="time-tracking-custom-duration"
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
                min={1}
                max={1440}
                step={1}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="time-tracking-note">Note (optional)</Label>
            <Textarea
              id="time-tracking-note"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              ref={noteTextareaRef}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pb-4">
            <Button type="button" onClick={handleClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
