import React, { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TimeTrackAggregationResponse } from '../../../../api/dtos/time-tracks.dtos';
import { ROUTES } from '../../../../constants/routes';
import styles from './DailyTimeTracksDataGrid.module.css';
import { getCurrentDateString } from '../../../../utils/dateUtils';
import { useDailyTimeTracksAggregation } from '../../hooks/useDailyTimeTracksAggregation';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDate = (dateString: string): string => {
  // Parse the date string as local date to avoid timezone shifts
  // Assuming the dateString is in YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

type Row = {
  id: number;
  noteName: string;
  dailyTimeMinutes: number;
  totalTimeMinutes: number;
  mostRecentDate: string;
};

type SortField = keyof Omit<Row, 'id'>;
type SortDirection = 'asc' | 'desc';

const COLUMNS: { field: SortField; header: string }[] = [
  { field: 'noteName', header: 'Note' },
  { field: 'dailyTimeMinutes', header: 'Daily Time' },
  { field: 'totalTimeMinutes', header: 'Total Time' },
  { field: 'mostRecentDate', header: 'Last Activity' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25];

type Props = {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  data?: TimeTrackAggregationResponse[];
  loading?: boolean;
};

export const DailyTimeTracksDataGrid: React.FC<Props> = ({
  selectedDate: externalSelectedDate,
  onDateChange,
  data: externalData,
  loading: externalLoading,
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(
    () => {
      return getCurrentDateString();
    }
  );
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('dailyTimeMinutes');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const selectedDate = externalSelectedDate || internalSelectedDate;
  const shouldFetch = !externalData;

  const {
    data: internalData,
    isLoading: internalLoading,
    error: internalError,
  } = useDailyTimeTracksAggregation(selectedDate, shouldFetch);

  const timeTracks = externalData || internalData;
  const loading = externalLoading || internalLoading;
  const error = internalError;

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      setInternalSelectedDate(newDate);
    }
  };

  const handleTodayClick = () => {
    const todayDate = getCurrentDateString();
    if (onDateChange) {
      onDateChange(todayDate);
    } else {
      setInternalSelectedDate(todayDate);
    }
  };

  const handleRowClick = (noteId: number) => {
    navigate(ROUTES.NOTE(noteId));
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPageIndex(0);
  };

  const rows: Row[] = useMemo(
    () =>
      timeTracks.map(track => ({
        id: track.noteId,
        noteName: track.noteName,
        dailyTimeMinutes: track.dailyTimeMinutes,
        totalTimeMinutes: track.totalTimeMinutes,
        mostRecentDate: track.mostRecentDate,
      })),
    [timeTracks]
  );

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1);
  const pagedRows = sortedRows.slice(
    clampedPageIndex * pageSize,
    clampedPageIndex * pageSize + pageSize
  );

  const shouldShowControls = !externalSelectedDate && !onDateChange;

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className={styles.sortIcon} />;
    }
    const Icon = sortDirection === 'asc' ? ArrowUp : ArrowDown;
    return <Icon className={`${styles.sortIcon} ${styles.sortIconActive}`} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Daily Time Tracks</h2>
        {shouldShowControls && (
          <div className={styles.dateControls}>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="h-9 min-w-[150px]"
            />
            <Button size="sm" onClick={handleTodayClick} className="min-w-[70px]">
              Today
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className={styles.error}>
          <span className="text-destructive">{error}</span>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            {rows.length === 0 ? (
              <div className={styles.emptyRow}>
                No time tracks found for {formatDate(selectedDate)}
              </div>
            ) : (
              <Table className={styles.table}>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map(col => (
                      <TableHead key={col.field}>
                        <button
                          type="button"
                          className={styles.sortHeader}
                          onClick={() => handleSort(col.field)}
                        >
                          {col.header}
                          {renderSortIcon(col.field)}
                        </button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRows.map(row => (
                    <TableRow
                      key={row.id}
                      className={styles.row}
                      onClick={() => handleRowClick(row.id)}
                    >
                      <TableCell className={styles.noteTitle} title={row.noteName}>
                        {row.noteName}
                      </TableCell>
                      <TableCell>{formatTime(row.dailyTimeMinutes)}</TableCell>
                      <TableCell>{formatTime(row.totalTimeMinutes)}</TableCell>
                      <TableCell>{formatDate(row.mostRecentDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {rows.length > 0 && (
            <div className={styles.pagination}>
              <span>
                {clampedPageIndex * pageSize + 1}–
                {Math.min((clampedPageIndex + 1) * pageSize, sortedRows.length)} of{' '}
                {sortedRows.length}
              </span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="h-7 rounded border border-input bg-transparent px-1 text-sm"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                disabled={clampedPageIndex === 0}
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={clampedPageIndex >= pageCount - 1}
                onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
