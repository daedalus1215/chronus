import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  List,
  ListItemButton,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import NoteIcon from '@mui/icons-material/Note';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useNavigate } from 'react-router-dom';
import { searchNotes } from '../../api/requests/notes.requests';
import { SearchResult } from '../../api/dtos/note.dtos';
import styles from './SearchPage.module.css';

const MATCH_TYPE_LABELS: Record<SearchResult['matchType'], string> = {
  note_name: 'Title',
  memo_content: 'Content',
  check_item: 'Checklist item',
};

const DEBOUNCE_MS = 400;

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchNotes(q.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleClick = (noteId: number) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <Box className={styles.page}>
      <Box className={styles.searchBar}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search memos and checklists..."
          value={query}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={18} />
                ) : (
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {!searched && !loading && (
        <Box className={styles.emptyState}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            Type at least 2 characters to search
          </Typography>
        </Box>
      )}

      {searched && results.length === 0 && !loading && (
        <Box className={styles.emptyState}>
          <Typography color="text.secondary">No results for "{query}"</Typography>
        </Box>
      )}

      {results.length > 0 && (
        <List disablePadding className={styles.resultList}>
          {results.map((result, idx) => (
            <Paper
              key={`${result.noteId}-${result.matchType}-${idx}`}
              elevation={0}
              className={styles.resultItem}
            >
              <ListItemButton
                onClick={() => handleClick(result.noteId)}
                className={styles.resultButton}
              >
                <Box className={styles.resultContent}>
                  <Box className={styles.resultHeader}>
                    {result.isMemo ? (
                      <NoteIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    ) : (
                      <CheckBoxIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                    )}
                    <Typography variant="subtitle2" className={styles.noteName}>
                      {result.noteName}
                    </Typography>
                    <Chip
                      label={MATCH_TYPE_LABELS[result.matchType]}
                      size="small"
                      variant="outlined"
                      className={styles.matchChip}
                    />
                  </Box>
                  <Typography variant="body2" className={styles.context}>
                    <span className={styles.contextText}>{result.contextBefore}</span>
                    <mark className={styles.highlight}>{result.matchText}</mark>
                    <span className={styles.contextText}>{result.contextAfter}</span>
                  </Typography>
                </Box>
              </ListItemButton>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};
