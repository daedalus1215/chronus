import { useMemo, useState } from 'react';
import { CheckItem } from '../../../api/responses';

export type StatusFilter = 'all' | 'ready' | 'in_progress' | 'review' | 'done';

export type FilterState = {
  searchText: string;
  statusFilter: StatusFilter;
};

export type UseCheckItemFiltersReturn = {
  filters: FilterState;
  setSearchText: (text: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  clearSearch: () => void;
  clearFilters: () => void;
  filteredItems: CheckItem[];
  matchCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
};

export function useCheckItemFilters(
  checkItems: CheckItem[]
): UseCheckItemFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    statusFilter: 'all',
  });

  const setSearchText = (text: string) =>
    setFilters(prev => ({ ...prev, searchText: text }));

  const setStatusFilter = (status: StatusFilter) =>
    setFilters(prev => ({ ...prev, statusFilter: status }));

  const clearSearch = () => setFilters(prev => ({ ...prev, searchText: '' }));

  const clearFilters = () =>
    setFilters({ searchText: '', statusFilter: 'all' });

  const hasActiveFilters =
    filters.searchText.trim().length > 0 || filters.statusFilter !== 'all';

  const filteredItems = useMemo(() => {
    const { searchText, statusFilter } = filters;
    const hasTextFilter = searchText.trim().length > 0;
    const hasStatusFilter = statusFilter !== 'all';

    if (!hasTextFilter && !hasStatusFilter) {
      return checkItems;
    }

    return checkItems.filter(item => {
      if (hasTextFilter) {
        const match = item.name
          .toLowerCase()
          .includes(searchText.toLowerCase());
        if (!match) return false;
      }
      if (hasStatusFilter) {
        if (item.status !== statusFilter) return false;
      }
      return true;
    });
  }, [checkItems, filters]);

  const matchCount = filteredItems.length;
  const totalCount = checkItems.length;

  return {
    filters,
    setSearchText,
    setStatusFilter,
    clearSearch,
    clearFilters,
    filteredItems,
    matchCount,
    totalCount,
    hasActiveFilters,
  };
}
