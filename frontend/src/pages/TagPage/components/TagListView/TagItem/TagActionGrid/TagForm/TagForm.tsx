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

  useEffect(() => {
    if (isOpen) {
      // Initialize or update form data when form opens or initialData becomes available
      if (initialData) {
        setFormData(initialData);
      }
    } else {
      // Reset when form closes
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
      <Stack 
        spacing={2} 
        component="form" 
        onSubmit={handleSubmit}
        onClick={(e) => {
          // Prevent clicks inside the form from propagating
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          // Prevent mouse down events from propagating
          e.stopPropagation();
        }}
      >
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
          fullWidth
          multiline
          rows={3}
          InputLabelProps={{ shrink: true }}
          onClick={(e) => {
            // Prevent clicks on the text field from propagating
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Prevent mouse down on the text field from propagating
            e.stopPropagation();
          }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
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
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
};
