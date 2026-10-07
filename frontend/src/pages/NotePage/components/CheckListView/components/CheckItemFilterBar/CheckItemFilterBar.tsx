import React from 'react';
import { Search, X, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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

const statusBadgeStyle = (
  opt: { value: StatusFilter; color: string },
  active: boolean
): React.CSSProperties => ({
  borderColor: opt.color,
  backgroundColor: active ? opt.color : 'transparent',
  color: active
    ? opt.value === 'in_progress' || opt.value === 'review'
      ? '#000'
      : '#fff'
    : opt.color,
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
});

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}> = ({ value, onChange, onClear }) => (
  <div className="relative flex-1">
    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input
      placeholder="Search items..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    />
    {value && (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClear}
        className="absolute right-1 top-1/2 -translate-y-1/2"
      >
        <X className="size-4" />
      </Button>
    )}
  </div>
);

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
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded(v => !v)}
            className={hasActiveFilters ? 'bg-primary/10 text-primary' : undefined}
          >
            <ListFilter className="size-4" />
          </Button>
          {hasActiveFilters && (
            <Badge
              variant="outline"
              className="h-[22px] cursor-pointer gap-1 text-[0.7rem]"
              onClick={clearFilters}
            >
              {matchCount} of {totalCount}
              <X className="size-3" />
            </Badge>
          )}
        </div>
        {expanded && (
          <div className="p-2 pt-0">
            <SearchInput
              value={filters.searchText}
              onChange={setSearchText}
              onClear={clearSearch}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(opt => (
                <Badge
                  key={opt.value}
                  variant="outline"
                  style={statusBadgeStyle(opt, filters.statusFilter === opt.value)}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <SearchInput
          value={filters.searchText}
          onChange={setSearchText}
          onClear={clearSearch}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-muted-foreground">Status:</span>
        {STATUS_OPTIONS.map(opt => (
          <Badge
            key={opt.value}
            variant="outline"
            style={statusBadgeStyle(opt, filters.statusFilter === opt.value)}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
        {hasActiveFilters && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <span className="text-xs text-muted-foreground">
              {matchCount} of {totalCount} item{matchCount !== 1 ? 's' : ''}{' '}
              match
            </span>
            <Badge
              variant="outline"
              className={cn('h-[22px] cursor-pointer text-[0.7rem]')}
              onClick={clearFilters}
            >
              Clear all
            </Badge>
          </>
        )}
      </div>
    </div>
  );
};
