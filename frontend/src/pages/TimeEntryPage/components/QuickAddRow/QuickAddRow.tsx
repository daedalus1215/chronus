import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Chip,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
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

  const handleDurationChipClick = (min: number) => {
    setDuration(String(min));
  };

  const isOptionEqualToValue = (
    option: NoteAutocompleteOption,
    value: NoteAutocompleteOption
  ) => {
    return option.id === value.id;
  };

  const canSubmit = selectedNote && duration && parseInt(duration, 10) >= 1;

  return (
    <Paper className={styles.container} elevation={0}>
      <Box className={styles.header}>
        <ScheduleIcon className={styles.headerIcon} />
        <Typography className={styles.headerTitle}>
          Quick Add Time Entry
        </Typography>
      </Box>

      <Box className={styles.formRow}>
        <Box className={styles.noteField}>
          <Autocomplete
            options={displayOptions}
            loading={searchLoading}
            getOptionLabel={opt => (opt as { name: string }).name}
            isOptionEqualToValue={isOptionEqualToValue}
            value={selectedNote ?? null}
            onChange={(_e, val) =>
              handleSelect(val as NoteAutocompleteOption | null)
            }
            onInputChange={(_e, val, reason) => {
              if (reason === 'input') {
                setQuery(val);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                placeholder="Search note..."
                size="small"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <SearchIcon className={styles.searchIcon} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searchLoading ? (
                        <CircularProgress
                          size={18}
                          className={styles.loadingSpinner}
                        />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText="Type at least 2 characters"
          />
        </Box>

        <Box className={styles.dateTimeFields}>
          <TextField
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            size="small"
            className={styles.dateField}
          />
          <TextField
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            className={styles.timeField}
          />
        </Box>

        <Box className={styles.durationSection}>
          <TextField
            type="number"
            placeholder="30"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            size="small"
            className={styles.durationInput}
            inputProps={{ min: 1, max: 1440 }}
            InputProps={{
              endAdornment: (
                <Typography className={styles.durationSuffix}>min</Typography>
              ),
            }}
          />
        </Box>

        <Box className={styles.actions}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={styles.addButton}
          >
            Add
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            className={styles.clearButton}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Box>
      </Box>

      <Box className={styles.chipsRow}>
        <Typography className={styles.chipsLabel}>Quick select:</Typography>
        <Box className={styles.chipsContainer}>
          {DURATION_CHIPS.map(min => (
            <Chip
              key={min}
              label={`${min}m`}
              size="small"
              onClick={() => handleDurationChipClick(min)}
              className={`${styles.durationChip} ${
                parseInt(duration, 10) === min
                  ? styles.durationChipSelected
                  : ''
              }`}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
