import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { BottomSheet } from '../../../../components/BottomSheet/BottomSheet';
import { useCalendarEvent } from '../../hooks/useCalendarEvent';
import { useUpdateCalendarEvent } from '../../hooks/useUpdateCalendarEvent';
import { useEventForm } from '../../hooks/useEventForm';
import { EventFormFields } from './EventFormFields/EventFormFields';

type EventDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | null;
};

/**
 * Modal component for viewing and editing calendar event details.
 * Supports two modes: view mode (read-only) and edit mode (with form).
 * Automatically refreshes the calendar after successful update.
 *
 * @param props - Component props
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback to close the modal
 * @param props.eventId - The ID of the event to display/edit, or null to disable
 */
export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const { data: event, isLoading, error } = useCalendarEvent(eventId);
  const updateMutation = useUpdateCalendarEvent();
  const [isEditing, setIsEditing] = useState(false);

  const {
    formData,
    validationErrors,
    isSubmitting,
    updateField,
    resetForm,
    handleSubmit: handleFormSubmit,
  } = useEventForm({
    event,
    onUpdate: async (data) => {
      if (!eventId) {
        return;
      }
      await updateMutation.mutateAsync({
        id: eventId,
        event: data,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit(e);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleClose = () => {
    if (!updateMutation.isPending && !isSubmitting) {
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
          <EventFormFields
            formData={formData}
            validationErrors={validationErrors}
            isEditing={isEditing}
            isSubmitting={isSubmitting || updateMutation.isPending}
            updateMutationError={updateMutation.error as Error | null}
            onFieldChange={updateField}
          />
          {isEditing ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outlined"
                startIcon={<CancelIcon />}
                disabled={isSubmitting || updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || updateMutation.isPending || !formData.title.trim()}
              >
                {isSubmitting || updateMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  'Save'
                )}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="button"
                onClick={handleClose}
                variant="outlined"
                disabled={isSubmitting || updateMutation.isPending}
              >
                Close
              </Button>
            </Box>
          )}
        </form>
      </Box>
    </BottomSheet>
  );
};

