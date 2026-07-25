import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import Collapse from '@mui/material/Collapse';
import { StatusFilter, FilterState } from '../hooks/useCheckItemFilters';

type CheckItemFilterBarProps = {
  filters: FilterState;
  setSearchText: (text: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  clearSearch: () => void;
  clearFilters: () => void;
  matchCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  compact?: boolean;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] =
  [
    { value: 'all', label: 'All', color: '#888' },
    { value: 'ready', label: 'Ready', color: '#4f46e5' },
    { value: 'in_progress', label: 'In Progress', color: '#facc15' },
    { value: 'review', label: 'Review', color: '#fb923c' },
    { value: 'done', label: 'Done', color: '#22c55e' },
  ];

export const CheckItemFilterBar: React.FC<CheckItemFilterBarProps> = ({
  filters,
  setSearchText,
  setStatusFilter,
  clearSearch,
  clearFilters,
  matchCount,
  totalCount,
  hasActiveFilters,
  compact = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (compact) {
    return (
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(v => !v)}
            color={hasActiveFilters ? 'primary' : 'default'}
            sx={{
              backgroundColor: hasActiveFilters
                ? 'primary.lighter'
                : 'transparent',
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
          {hasActiveFilters && (
            <Chip
              size="small"
              label={`${matchCount} of ${totalCount}`}
              onDelete={clearFilters}
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ p: 1, pt: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search items..."
              value={filters.searchText}
              onChange={e => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.searchText ? (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {STATUS_OPTIONS.map(opt => (
                <Chip
                  key={opt.value}
                  size="small"
                  label={opt.label}
                  onClick={() => setStatusFilter(opt.value)}
                  sx={{
                    borderColor: opt.color,
                    backgroundColor:
                      filters.statusFilter === opt.value
                        ? opt.color
                        : 'transparent',
                    color:
                      filters.statusFilter === opt.value
                        ? opt.value === 'in_progress' || opt.value === 'review'
                          ? '#000'
                          : '#fff'
                        : opt.color,
                    fontWeight: filters.statusFilter === opt.value ? 600 : 400,
                  }}
                  variant={
                    filters.statusFilter === opt.value ? 'filled' : 'outlined'
                  }
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search items..."
          value={filters.searchText}
          onChange={e => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={clearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" sx={{ mr: 0.5, color: 'text.secondary' }}>
          Status:
        </Typography>
        {STATUS_OPTIONS.map(opt => (
          <Chip
            key={opt.value}
            size="small"
            label={opt.label}
            onClick={() => setStatusFilter(opt.value)}
            sx={{
              borderColor: opt.color,
              backgroundColor:
                filters.statusFilter === opt.value ? opt.color : 'transparent',
              color:
                filters.statusFilter === opt.value
                  ? opt.value === 'in_progress' || opt.value === 'review'
                    ? '#000'
                    : '#fff'
                  : opt.color,
              fontWeight: filters.statusFilter === opt.value ? 600 : 400,
            }}
            variant={filters.statusFilter === opt.value ? 'filled' : 'outlined'}
          />
        ))}
        {hasActiveFilters && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {matchCount} of {totalCount} item{matchCount !== 1 ? 's' : ''}{' '}
              match
            </Typography>
            <Chip
              size="small"
              label="Clear all"
              onClick={clearFilters}
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};
