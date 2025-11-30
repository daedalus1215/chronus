import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

type DateTimePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(selectedDate);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Schedule Note
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="datetime-local"
            value={selectedDate.toISOString().slice(0, 16)}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            fullWidth
            sx={{ mb: 3 }}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              onClick={onClose}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Set Schedule
            </Button>
          </Box>
        </form>
      </Box>
    </BottomSheet>
  );
};
