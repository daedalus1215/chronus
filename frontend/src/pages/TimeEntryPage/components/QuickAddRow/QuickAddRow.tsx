import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, X, Search, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
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

  const [isNoteMenuOpen, setIsNoteMenuOpen] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);

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
    const dur = durRef.current
      ? parseInt(durRef.current, 10)
      : DEFAULT_DURATION;
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

  const handleNoteOptionSelect = (option: NoteAutocompleteOption) => {
    handleSelect(option);
    setIsNoteMenuOpen(false);
  };

  const handleNoteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNote) {
      // Typing again after a selection starts a fresh search.
      handleSelect(null);
    }
    setQuery(e.target.value);
    setIsNoteMenuOpen(true);
  };

  const canSubmit = selectedNote && duration && parseInt(duration, 10) >= 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Clock className={styles.headerIcon} />
        <span className={styles.headerTitle}>Quick Add Time Entry</span>
      </div>

      <div className={styles.formRow}>
        <div className={styles.noteField}>
          <Popover open={isNoteMenuOpen} onOpenChange={setIsNoteMenuOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex items-center">
                <Search className={styles.searchIcon} />
                <Input
                  ref={noteInputRef}
                  placeholder="Search note..."
                  value={selectedNote ? selectedNote.name : query}
                  onChange={handleNoteInputChange}
                  onFocus={() => setIsNoteMenuOpen(true)}
                  className="h-9"
                />
                {searchLoading && (
                  <Loader2 className={cn(styles.loadingSpinner, 'absolute right-2 size-[18px] animate-spin')} />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              onOpenAutoFocus={e => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {displayOptions.length === 0 ? (
                    <CommandEmpty>
                      {query.length < 2
                        ? 'Type at least 2 characters'
                        : 'No results'}
                    </CommandEmpty>
                  ) : (
                    displayOptions.map(opt => (
                      <CommandItem
                        key={opt.id}
                        value={String(opt.id)}
                        onSelect={() => handleNoteOptionSelect(opt)}
                      >
                        {opt.name}
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className={styles.dateTimeFields}>
          {!autoMode && (
            <button
              type="button"
              className="mb-1 block border-0 bg-transparent p-0 text-xs text-primary"
              onClick={handleResetToNow}
            >
              Reset to now
            </button>
          )}
          <Input
            type="date"
            value={date}
            onChange={e => {
              setAutoMode(false);
              setDate(e.target.value);
            }}
            className={cn(styles.dateField, 'h-9')}
          />
          <Input
            type="time"
            value={startTime}
            onChange={e => {
              setAutoMode(false);
              setStartTime(e.target.value);
            }}
            className={cn(styles.timeField, 'h-9')}
          />
        </div>

        <div className={styles.durationSection}>
          <div className="relative">
            <Input
              type="number"
              placeholder="30"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min={1}
              max={1440}
              className={cn(styles.durationInput, 'h-9 pr-10')}
            />
            <span className={cn(styles.durationSuffix, 'absolute right-2.5 top-1/2 -translate-y-1/2')}>
              min
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleSubmit} disabled={!canSubmit} className={styles.addButton}>
            <Plus /> Add
          </Button>
          <Button variant="outline" onClick={handleClear} className={styles.clearButton}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className={styles.chipsRow}>
        <span className={styles.chipsLabel}>Quick select:</span>
        <div className={styles.chipsContainer}>
          {DURATION_CHIPS.map(min => (
            <Badge
              key={min}
              className={cn(
                styles.durationChip,
                parseInt(duration, 10) === min && styles.durationChipSelected
              )}
              onClick={() => handleDurationChipClick(min)}
            >
              {min}m
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
