import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  CheckItemFilters,
  CheckItemStatus,
  ALL_STATUSES,
  DEFAULT_FILTERS,
} from '../types';

interface CheckItemFilterBarProps {
  filters: CheckItemFilters;
  onFiltersChange: (filters: CheckItemFilters) => void;
  totalItemCount?: number;
}

const STATUS_LABELS: Record<CheckItemStatus, string> = {
  ready: 'Ready',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const STATUS_COLORS: Record<CheckItemStatus, string> = {
  ready: '#4f46e5',
  in_progress: '#facc15',
  review: '#fb923c',
  done: '#22c55e',
};

export function CheckItemFilterBar({
  filters,
  onFiltersChange,
  totalItemCount,
}: CheckItemFilterBarProps) {
  const hasActiveFilters =
    filters.query !== '' ||
    filters.status.length > 0 ||
    filters.includeDone === false;

  const handleToggleStatus = (status: CheckItemStatus) => {
    const currentStatuses = filters.status;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleClear = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ p: 1, flexWrap: 'wrap', gap: 1 }}
    >
      {/* Text Search */}
      <TextField
        size="small"
        placeholder="Search items..."
        value={filters.query}
        onChange={e =>
          onFiltersChange({ ...filters, query: e.target.value })
        }
        InputProps={{
          startAdornment: (
            <SearchIcon
              fontSize="small"
              sx={{ mr: 1, color: 'text.secondary' }}
            />
          ),
        }}
        sx={{ minWidth: 180, flex: '1 1 180px' }}
      />

      {/* Status Filter Chips */}
      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
        {ALL_STATUSES.map(status => {
          const isActive = filters.status.includes(status);
          return (
            <Chip
              key={status}
              label={STATUS_LABELS[status]}
              size="small"
              onClick={() => handleToggleStatus(status)}
              sx={{
                borderColor: STATUS_COLORS[status],
                color: isActive ? STATUS_COLORS[status] : 'text.secondary',
                backgroundColor: isActive
                  ? `${STATUS_COLORS[status]}22`
                  : 'transparent',
                border: isActive ? `1px solid ${STATUS_COLORS[status]}` : '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                '&:hover': {
                  backgroundColor: `${STATUS_COLORS[status]}11`,
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Include Done Toggle */}
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={filters.includeDone}
            onChange={e =>
              onFiltersChange({ ...filters, includeDone: e.target.checked })
            }
          />
        }
        label="Show done"
        sx={{ ml: 1, flexShrink: 0 }}
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Tooltip title="Clear filters">
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Item count */}
      {totalItemCount !== undefined && hasActiveFilters && (
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginLeft: 'auto',
          }}
        >
          {filters.query || filters.status.length > 0 || !filters.includeDone
            ? `${totalItemCount} item${totalItemCount === 1 ? '' : 's'}`
            : ''}
        </span>
      )}
    </Stack>
  );
}
