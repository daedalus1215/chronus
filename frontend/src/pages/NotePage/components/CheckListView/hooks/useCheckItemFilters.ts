import { useState, useCallback, useRef, useEffect } from 'react';
import {
  CheckItemFilters,
  DEFAULT_FILTERS,
} from '../types';

interface UseCheckItemFiltersReturn {
  filters: CheckItemFilters;
  setFilters: (filters: CheckItemFilters) => void;
  setQuery: (query: string) => void;
  setStatus: (status: string[]) => void;
  setIncludeDone: (includeDone: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useCheckItemFilters(): UseCheckItemFiltersReturn {
  const [filters, setFiltersState] = useState<CheckItemFilters>(DEFAULT_FILTERS);

  // Debounce for query changes
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((newFilters: CheckItemFilters) => {
    setFiltersState(newFilters);
  }, []);

  const setQuery = useCallback(
    (query: string) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new debounce timer (300ms)
      debounceTimerRef.current = setTimeout(() => {
        setFiltersState(prev => ({ ...prev, query }));
      }, 300);
    },
    []
  );

  const setStatus = useCallback((status: string[]) => {
    setFiltersState(prev => ({ ...prev, status }));
  }, []);

  const setIncludeDone = useCallback((includeDone: boolean) => {
    setFiltersState(prev => ({ ...prev, includeDone }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.query !== '' ||
    filters.status.length > 0 ||
    filters.includeDone === false;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    filters,
    setFilters,
    setQuery,
    setStatus,
    setIncludeDone,
    clearFilters,
    hasActiveFilters,
  };
}
