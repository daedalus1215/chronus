import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Stack } from "@mui/material";
import { BottomSheet } from '@components/BottomSheet/BottomSheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormInitialData) => void;
  initialData?: FormInitialData;
  isSubmitting?: boolean;
}

export type FormInitialData = {
  name: string;
  description: string;
}

export const TagForm: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<FormInitialData>({
    name: '',
    description: ''
  });
  const formOpenSessionRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Generate a unique session ID for this form open
      if (!formOpenSessionRef.current) {
        formOpenSessionRef.current = `${Date.now()}`;
      }
      
      // Initialize or update form data when form opens or initialData becomes available
      if (initialData) {
        setFormData(initialData);
      }
    } else {
      // Reset when form closes
      formOpenSessionRef.current = null;
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Box>
            <h3>Edit Tag</h3>
          </Box>
          <TextField
            label="Title"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            onBlur={(e) => {
              // Prevent blur from triggering any parent handlers
              e.stopPropagation();
            }}
            onFocus={(e) => {
              // Prevent focus from triggering any parent handlers
              e.stopPropagation();
            }}
            fullWidth
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
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
