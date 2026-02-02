import React, { useRef } from 'react';
import { InputAdornment, IconButton, TextField } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  type?: 'MEMO' | 'CHECKLIST';
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  type,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

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
              <SearchIcon color="action" style={{ marginTop: '10px' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={onClear}
                edge="end"
                style={{ marginTop: '10px' }}
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
            paddingBottom: '10px',
            backgroundColor: 'background.paper',
          },
        }}
      />
    </div>
  );
};
