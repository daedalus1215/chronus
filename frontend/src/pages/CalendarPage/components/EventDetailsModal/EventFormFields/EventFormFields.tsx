import React from 'react';
import { TextField, Stack, Typography } from '@mui/material';
import { UpdateCalendarEventRequest } from '../../../../../api/dtos/calendar-events.dtos';
import { ValidationErrors } from '../../../utils/event-form-validation.utils';

type EventFormFieldsProps = {
  formData: UpdateCalendarEventRequest;
  validationErrors: ValidationErrors;
  isEditing: boolean;
  isSubmitting: boolean;
  updateMutationError: Error | null;
  onFieldChange: (
    field: keyof UpdateCalendarEventRequest,
    value: string
  ) => void;
};

/**
 * Component for rendering event form fields.
 * Handles all form input fields with validation display.
 *
 * @param props - Component props
 * @param props.formData - Current form data values
 * @param props.validationErrors - Validation error messages
 * @param props.isEditing - Whether form is in edit mode
 * @param props.isSubmitting - Whether form submission is in progress
 * @param props.updateMutationError - Error from update mutation
 * @param props.onFieldChange - Callback when field value changes
 */
export const EventFormFields: React.FC<EventFormFieldsProps> = ({
  formData,
  validationErrors,
  isEditing,
  isSubmitting,
  updateMutationError,
  onFieldChange,
}) => {
  return (
    <Stack spacing={2}>
      <TextField
        label="Title"
        value={formData.title}
        onChange={e => onFieldChange('title', e.target.value)}
        required
        fullWidth
        disabled={!isEditing || isSubmitting}
        error={!!validationErrors.title}
        helperText={validationErrors.title}
      />
      <TextField
        label="Description"
        value={formData.description}
        onChange={e => onFieldChange('description', e.target.value)}
        multiline
        rows={3}
        fullWidth
        disabled={!isEditing || isSubmitting}
      />
      <TextField
        label="Start Date & Time"
        type="datetime-local"
        value={formData.startDate}
        onChange={e => onFieldChange('startDate', e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        disabled={!isEditing || isSubmitting}
        error={!!validationErrors.startDate}
        helperText={validationErrors.startDate}
      />
      <TextField
        label="End Date & Time"
        type="datetime-local"
        value={formData.endDate}
        onChange={e => onFieldChange('endDate', e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        disabled={!isEditing || isSubmitting}
        error={!!validationErrors.endDate}
        helperText={validationErrors.endDate}
      />
      {updateMutationError && (
        <Typography color="error" variant="body2">
          {updateMutationError instanceof Error
            ? updateMutationError.message
            : 'Failed to update event'}
        </Typography>
      )}
    </Stack>
  );
};
