import React, { useRef } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import styles from './ExplorerTree.module.css';

type ExplorerFilterBarProps = {
  query: string;
  setQuery: (q: string) => void;
};

export const ExplorerFilterBar: React.FC<ExplorerFilterBarProps> = ({
  query,
  setQuery,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box className={styles.filterBar}>
      <TextField
        inputRef={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter folders and notes..."
        variant="standard"
        size="small"
        className={styles.filterInput}
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.35)',
                mr: 0.5,
              }}
            />
          ),
          endAdornment: query ? (
            <IconButton
              size="small"
              className={styles.filterClear}
              onClick={() => {
                setQuery('');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <ClearIcon sx={{ fontSize: 13 }} />
            </IconButton>
          ) : null,
        }}
      />
    </Box>
  );
};
