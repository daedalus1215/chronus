import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { getDateString, getTimeString } from '../../../../utils/dateUtils';

const DURATION_CHIPS = [15, 30, 45, 60, 90, 120, 150, 180];

const DEFAULT_DURATION = 30;

function buildBackdatedDefaults(
  anchor: Date,
  durationMinutes: number
): { date: string; startTime: string } {
  const calc = new Date(anchor.getTime() - durationMinutes * 60 * 1000);
  return {
    date: getDateString(calc),
    startTime: getTimeString(calc),
  };
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

  // Anchor time — captured at mount, re-anchored on note selection
  const [anchorNow, setAnchorNow] = useState(() => new Date());
  const [autoMode, setAutoMode] = useState(true);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');

  // Stable refs for cross-effect reads (avoids exhaustive-deps loops)
  const anchorRef = useRef(anchorNow);
  const autoRef = useRef(autoMode);
  const durRef = useRef(duration);
  anchorRef.current = anchorNow;
  autoRef.current = autoMode;
  durRef.current = duration;

  const applyBackdate = (anchor: Date) => {
    const dur = durRef.current ? parseInt(durRef.current, 10) : DEFAULT_DURATION;
    if (!isNaN(dur) && dur >= 1) {
      const backdated = buildBackdatedDefaults(anchor, dur);
      setDate(backdated.date);
      setStartTime(backdated.startTime);
    }
  };

  /* ── Initial backdate at mount (auto mode) ── */
  useEffect(() => {
    if (autoRef.current && anchorRef.current) {
      applyBackdate(anchorRef.current);
    }
  }, []);

  /* ── Re-backdate when duration changes in auto mode ── */
  useEffect(() => {
    if (autoRef.current && anchorRef.current && durRef.current) {
      applyBackdate(anchorRef.current);
    }
  }, [duration]);

  /* ── Re-anchor when a note is selected ── */
  useEffect(() => {
    if (selectedNote && autoRef.current) {
      const now = new Date();
      setAnchorNow(now);
      applyBackdate(now);
    }
  }, [selectedNote]);

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

  /* ── Reset to now ── */
  const handleResetToNow = () => {
    const now = new Date();
    setAnchorNow(now);
    setAutoMode(true);
    const dur = duration ? parseInt(duration, 10) : DEFAULT_DURATION;
    if (!isNaN(dur) && dur >= 1) {
      const backdated = buildBackdatedDefaults(now, dur);
      setDate(backdated.date);
      setStartTime(backdated.startTime);
    }
  };

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
    setAnchorNow(new Date());
    setAutoMode(true);
    const backdated = buildBackdatedDefaults(new Date(), DEFAULT_DURATION);
    setDate(backdated.date);
    setStartTime(backdated.startTime);
    setDuration('');
  };

  const handleClear = () => {
    reset();
    setAnchorNow(new Date());
    setAutoMode(true);
    const backdated = buildBackdatedDefaults(new Date(), DEFAULT_DURATION);
    setDate(backdated.date);
    setStartTime(backdated.startTime);
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
          {!autoMode && (
            <Typography
              component="span"
              color="primary"
              sx={{
                cursor: 'pointer',
                fontSize: '0.75rem',
                mb: 0.5,
                display: 'block',
              }}
              onClick={handleResetToNow}
            >
              Reset to now
            </Typography>
          )}
          <TextField
            type="date"
            value={date}
            onChange={e => {
              setAutoMode(false);
              setDate(e.target.value);
            }}
            size="small"
            className={styles.dateField}
          />
          <TextField
            type="time"
            value={startTime}
            onChange={e => {
              setAutoMode(false);
              setStartTime(e.target.value);
            }}
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
