import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { CheckItem } from '../../../NotePage/api/responses';
import { CheckItemStatus } from '../../hooks/useUpdateCheckItemStatus';

export interface CardDetailsDialogProps {
  isOpen: boolean;
  item: CheckItem | null;
  onClose: () => void;
  onSave: (id: number, name: string, description: string | undefined, status: CheckItemStatus) => void;
}

export const CardDetailsDialog: React.FC<CardDetailsDialogProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CheckItemStatus>('ready');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setStatus(item.status || 'ready');
    } else {
      setName('');
      setDescription('');
      setStatus('ready');
    }
  }, [item, isOpen]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<CheckItemStatus>) => {
    setStatus(event.target.value as CheckItemStatus);
  };

  const handleSave = () => {
    if (item && name.trim()) {
      onSave(
        item.id,
        name.trim(),
        description.trim() || undefined,
        status
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Card Details</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          fullWidth
          required
          value={name}
          onChange={handleNameChange}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={handleDescriptionChange}
          sx={{ marginBottom: 2 }}
        />
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="ready">Ready for Work</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review">Ready for Review</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
