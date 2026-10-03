import { useState, useCallback, useMemo } from 'react';

export function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

export function getToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

export interface DateRange {
  from: string;
  to: string;
}

export function useTimeTrackDateRange(initialDays: number = 5) {
  const [from, setFrom] = useState(() => getDaysAgo(initialDays - 1));
  const [to, setTo] = useState(getToday);

  const range: DateRange = useMemo(() => ({ from, to }), [from, to]);

  const setPreset = useCallback((days: number) => {
    setFrom(getDaysAgo(days - 1));
    setTo(getToday());
  }, []);

  const setCustom = useCallback((newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
  }, []);

  return { from, to, range, setFrom, setTo, setPreset, setCustom };
}
