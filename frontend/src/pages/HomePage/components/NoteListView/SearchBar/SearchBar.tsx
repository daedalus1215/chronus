import React, { useEffect, useRef } from 'react';
import { InputAdornment, IconButton, TextField } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  type?: 'MEMO' | 'CHECKLIST';
  /**
   * When true, a bare Tab press while the page background has focus
   * (no element focused) moves focus to the input and selects any
   * existing text. Tab with modifiers, Shift+Tab, and Tab from any
   * focused element are left to the browser.
   */
  tabFocusEnabled?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  type,
  tabFocusEnabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tabFocusEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (document.activeElement !== document.body) return;
      event.preventDefault();
      const input = inputRef.current;
      input?.focus();
      input?.select();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabFocusEnabled]);

  let placeholder = 'Search notes...';
  if (type === 'MEMO') placeholder = 'Search memos...';
  if (type === 'CHECKLIST') placeholder = 'Search checklists...';

  return (
    <div className={styles.searchBar}>
      <TextField
        fullWidth
        inputRef={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={onClear}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '40px',
            marginBottom: '10px',
            backgroundColor: 'background.paper',
          },
        }}
      />
    </div>
  );
};
