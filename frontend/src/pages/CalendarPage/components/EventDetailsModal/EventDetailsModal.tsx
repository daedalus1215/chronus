import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { BottomSheet } from '../../../../components/BottomSheet/BottomSheet';
import { useCalendarEvent } from '../../hooks/useCalendarEvent';
import { useUpdateCalendarEvent } from '../../hooks/useUpdateCalendarEvent';
import { UpdateCalendarEventRequest } from '../../../../api/dtos/calendar-events.dtos';
import { format } from 'date-fns';

type EventDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | null;
};

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const { data: event, isLoading, error } = useCalendarEvent(eventId);
  const updateMutation = useUpdateCalendarEvent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateCalendarEventRequest>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      });
      setIsEditing(false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: eventId,
        event: {
          title: formData.title,
          description: formData.description || undefined,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        },
      });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating calendar event:', error);
    }
  };

  const handleCancel = () => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      });
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setIsEditing(false);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </BottomSheet>
    );
  }

  if (error || !event) {
    return (
      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Error
          </Typography>
          <Typography color="error">
            {error instanceof Error
              ? error.message
              : 'Failed to load event details'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleClose} variant="outlined">
              Close
            </Button>
          </Box>
        </Box>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {isEditing ? 'Edit Event' : 'Event Details'}
          </Typography>
          {!isEditing && (
            <IconButton
              onClick={() => setIsEditing(true)}
              disabled={updateMutation.isPending}
              aria-label="edit event"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
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
              disabled={!isEditing || updateMutation.isPending}
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
              disabled={!isEditing || updateMutation.isPending}
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
              disabled={!isEditing || updateMutation.isPending}
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
              disabled={!isEditing || updateMutation.isPending}
            />
            {updateMutation.error && (
              <Typography color="error" variant="body2">
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Failed to update event'}
              </Typography>
            )}
            {isEditing ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={updateMutation.isPending || !formData.title.trim()}
                >
                  {updateMutation.isPending ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Save'
                  )}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outlined"
                  disabled={updateMutation.isPending}
                >
                  Close
                </Button>
              </Box>
            )}
          </Stack>
        </form>
      </Box>
    </BottomSheet>
  );
};

