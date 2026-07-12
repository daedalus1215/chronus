import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import styles from './QuickAddRow.module.css';
import {
  useNoteSearch,
  NoteAutocompleteOption,
  CreateOption,
} from '../../hooks/useNoteSearch';

const DURATION_CHIPS = [15, 30, 45, 60, 90, 120, 150, 180];

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function getToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

export type QuickAddFormData = {
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
};

type Props = {
  onSubmit: (data: QuickAddFormData) => void;
};

export const QuickAddRow: React.FC<Props> = ({ onSubmit }) => {
  const {
    query,
    setQuery,
    options,
    loading: searchLoading,
    selectedNote,
    handleSelect,
    reset,
    hasNoResults,
  } = useNoteSearch();

  const [date, setDate] = useState(getToday);
  const [startTime, setStartTime] = useState(getCurrentTime);
  const [duration, setDuration] = useState('');

  const createOption: CreateOption = useMemo(
    () => ({ id: '__create__', name: `+ Create '${query}' as new memo` }),
    [query]
  );

  const displayOptions: NoteAutocompleteOption[] = useMemo(() => {
    if (hasNoResults && query.length >= 2) {
      return [createOption as NoteAutocompleteOption];
    }
    return options as NoteAutocompleteOption[];
  }, [hasNoResults, query.length, createOption, options]);

  const handleSubmit = () => {
    if (!selectedNote || !duration || parseInt(duration, 10) < 1) return;
    onSubmit({
      noteId: selectedNote.id,
      date,
      startTime,
      durationMinutes: parseInt(duration, 10),
    });
    // Clear the row completely after submit
    reset();
    setDate(getToday());
    setStartTime(getCurrentTime());
    setDuration('');
  };

  const handleClear = () => {
    reset();
    setDate(getToday());
    setStartTime(getCurrentTime());
    setDuration('');
  };

  const isOptionEqualToValue = (option: NoteAutocompleteOption, value: NoteAutocompleteOption) => {
    return option.id === value.id;
  };

  return (
    <Box className={styles.row}>
      <Autocomplete
        options={displayOptions}
        loading={searchLoading}
        getOptionLabel={(opt) => (opt as { name: string }).name}
        isOptionEqualToValue={isOptionEqualToValue}
        value={selectedNote ?? null}
        onChange={(_e, val) => handleSelect(val as NoteAutocompleteOption | null)}
        onInputChange={(_e, val, reason) => {
          if (reason === 'input') {
            setQuery(val);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search note..."
            size="small"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {searchLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{ flex: 1, minWidth: 180 }}
          />
        )}
        noOptionsMessage={() => 'Type at least 2 characters'}
      />
      <TextField
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        sx={{ minWidth: 130 }}
      />
      <TextField
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 100 }}
      />
      <Box className={styles.duration}> 
        <TextField
          type="number"
          label="min"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          size="small"
          sx={{ width: 80 }}
          inputProps={{ min: 1, max: 1440 }}
        />
        <Box className={styles.chips}>
          {DURATION_CHIPS.map((min) => (
            <Chip
              key={min}
              label={`${min}`}
              size="small"
              onClick={() => setDuration(String(min))}
              sx={{
                fontSize: '0.7rem',
                height: 22,
                ...(parseInt(duration, 10) === min
                  ? { bgcolor: 'primary.main', color: 'white' }
                  : {}),
              }}
            />
          ))}
        </Box>
      </Box>
      <Box className={styles.actions}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleSubmit}
          disabled={!selectedNote || !duration || parseInt(duration, 10) < 1}
        >
          Add
        </Button>
        <Button
          size="small"
          color="inherit"
          onClick={handleClear}
        >
          <CloseIcon />
        </Button>
      </Box>
    </Box>
  );
};
