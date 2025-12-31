import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { BottomSheet } from '../../../../components/BottomSheet/BottomSheet';
import { useCreateCalendarEvent } from '../../hooks/useCreateCalendarEvent';
import { CreateCalendarEventRequest } from '../../../../api/dtos/calendar-events.dtos';
import { format } from 'date-fns';

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  defaultDate = new Date(),
}) => {
  const createMutation = useCreateCalendarEvent();
  const [formData, setFormData] = useState<CreateCalendarEventRequest>({
    title: '',
    description: '',
    startDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
    endDate: format(
      new Date(defaultDate.getTime() + 60 * 60 * 1000),
      "yyyy-MM-dd'T'HH:mm",
    ),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
      onClose();
      setFormData({
        title: '',
        description: '',
        startDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        endDate: format(
          new Date(defaultDate.getTime() + 60 * 60 * 1000),
          "yyyy-MM-dd'T'HH:mm",
        ),
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose();
      setFormData({
        title: '',
        description: '',
        startDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        endDate: format(
          new Date(defaultDate.getTime() + 60 * 60 * 1000),
          "yyyy-MM-dd'T'HH:mm",
        ),
      });
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Create Calendar Event
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              fullWidth
              disabled={createMutation.isPending}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
              disabled={createMutation.isPending}
            />
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={createMutation.isPending}
            />
            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={createMutation.isPending}
            />
            {createMutation.error && (
              <Typography color="error" variant="body2">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to create event'}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                onClick={handleClose}
                variant="outlined"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || !formData.title.trim()}
              >
                {createMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  'Create Event'
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </BottomSheet>
  );
};

