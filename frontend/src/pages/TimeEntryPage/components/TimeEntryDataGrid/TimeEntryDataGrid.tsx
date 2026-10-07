import React, { useMemo, useState } from 'react';
import {
  Trash2,
  MoreVertical,
  CalendarDays,
  Clock,
  Timer,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { TimeTrackWithNoteResponse } from '../../../../api/dtos/time-tracks.dtos';
import { ROUTES } from '../../../../constants/routes';
import {
  deleteTimeTrack,
  updateTimeTrack,
} from '../../../../api/requests/time-tracks.requests';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import styles from './TimeEntryDataGrid.module.css';

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

type Props = {
  rows: TimeTrackWithNoteResponse[];
  loading: boolean;
  onRowDeleted: (id: number) => void;
  onRowUpdated: (id: number, updated: TimeTrackWithNoteResponse) => void;
};

type EditField = 'date' | 'startTime' | 'durationMinutes' | 'note';

interface EditDialogState {
  open: boolean;
  row: TimeTrackWithNoteResponse | null;
  field: EditField | null;
  value: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortField = 'noteName' | 'date' | 'startTime' | 'durationMinutes' | 'note';
type SortDirection = 'asc' | 'desc';

const SORTABLE_COLUMNS: { field: SortField; header: string }[] = [
  { field: 'noteName', header: 'Note' },
  { field: 'date', header: 'Date' },
  { field: 'startTime', header: 'Start' },
  { field: 'durationMinutes', header: 'Duration' },
  { field: 'note', header: 'Memo' },
];

export const TimeEntryDataGrid: React.FC<Props> = ({
  rows,
  loading,
  onRowDeleted,
  onRowUpdated,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    row: null,
    field: null,
    value: '',
  });
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field !== sortField) {
      setSortField(field);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      // Third click returns to the natural (API) order, matching MUI
      // DataGrid's default asc -> desc -> none cycle.
      setSortField(null);
    }
    setPageIndex(0);
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1);
  const pagedRows = useMemo(
    () =>
      sortedRows.slice(
        clampedPageIndex * pageSize,
        clampedPageIndex * pageSize + pageSize
      ),
    [sortedRows, clampedPageIndex, pageSize]
  );

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className={styles.sortIcon} />;
    }
    const Icon = sortDirection === 'asc' ? ArrowUp : ArrowDown;
    return <Icon className={`${styles.sortIcon} ${styles.sortIconActive}`} />;
  };

  const handleDelete = async (id: number) => {
    onRowDeleted(id);
    try {
      await deleteTimeTrack(id);
    } catch {
      console.error('Failed to delete time track');
    }
  };

  const handleEditClick = (rowId: number, field: EditField) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    let value = '';
    switch (field) {
      case 'date':
        value = row.date;
        break;
      case 'startTime':
        value = row.startTime;
        break;
      case 'durationMinutes':
        value = String(row.durationMinutes);
        break;
      case 'note':
        value = row.note || '';
        break;
    }

    setEditDialog({ open: true, row, field, value });
    setOpenMenuRowId(null);
  };

  const handleSaveEdit = async () => {
    if (!editDialog.row || !editDialog.field) return;

    const updates: Record<string, unknown> = {};
    switch (editDialog.field) {
      case 'date':
        updates.date = editDialog.value;
        break;
      case 'startTime':
        updates.startTime = editDialog.value;
        break;
      case 'durationMinutes':
        updates.durationMinutes = parseInt(editDialog.value) || 0;
        break;
      case 'note':
        updates.note = editDialog.value;
        break;
    }

    try {
      await updateTimeTrack(editDialog.row.id, updates);
      onRowUpdated(editDialog.row.id, {
        ...editDialog.row,
        ...updates,
      } as TimeTrackWithNoteResponse);
    } catch {
      console.error('Failed to update time track');
    } finally {
      setEditDialog({ open: false, row: null, field: null, value: '' });
    }
  };

  const getEditDialogTitle = () => {
    switch (editDialog.field) {
      case 'date':
        return 'Edit Date';
      case 'startTime':
        return 'Edit Start Time';
      case 'durationMinutes':
        return 'Edit Duration';
      case 'note':
        return 'Edit Note';
      default:
        return 'Edit';
    }
  };

  const getEditDialogInput = () => {
    switch (editDialog.field) {
      case 'date':
        return (
          <Input
            type="date"
            value={editDialog.value}
            onChange={e =>
              setEditDialog(prev => ({ ...prev, value: e.target.value }))
            }
          />
        );
      case 'startTime':
        return (
          <Input
            type="time"
            value={editDialog.value}
            onChange={e =>
              setEditDialog(prev => ({ ...prev, value: e.target.value }))
            }
          />
        );
      case 'durationMinutes':
        return (
          <Input
            type="number"
            value={editDialog.value}
            onChange={e =>
              setEditDialog(prev => ({ ...prev, value: e.target.value }))
            }
            min={1}
            max={1440}
          />
        );
      case 'note':
        return (
          <Textarea
            value={editDialog.value}
            onChange={e =>
              setEditDialog(prev => ({ ...prev, value: e.target.value }))
            }
            rows={2}
          />
        );
      default:
        return null;
    }
  };

  const renderActions = (row: TimeTrackWithNoteResponse) => (
    <>
      <DropdownMenu
        open={openMenuRowId === row.id}
        onOpenChange={open => setOpenMenuRowId(open ? row.id : null)}
      >
        <DropdownMenuTrigger asChild>
          <button type="button" className={styles.actionButton}>
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditClick(row.id, 'date')}>
            <CalendarDays className="size-4" /> Edit Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditClick(row.id, 'startTime')}>
            <Clock className="size-4" /> Edit Start Time
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditClick(row.id, 'durationMinutes')}>
            <Timer className="size-4" /> Edit Duration
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditClick(row.id, 'note')}>
            <FileText className="size-4" /> Edit Memo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.deleteButton}`}
        onClick={() => handleDelete(row.id)}
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  const renderNoteLink = (row: TimeTrackWithNoteResponse) => (
    <button
      type="button"
      onClick={() => navigate(ROUTES.NOTE(row.noteId))}
      className={styles.noteLink}
    >
      {row.noteName}
    </button>
  );

  return (
    <>
      <div className={styles.gridContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateText}>
              No time tracks for this period.
              <br />
              Use the Quick Add section above to add one.
            </span>
          </div>
        ) : isMobile ? (
          <div className={styles.mobileList}>
            {pagedRows.map(row => (
              <div key={row.id} className={styles.mobileCard}>
                <div className={styles.mobileCardTop}>{renderNoteLink(row)}</div>
                <div className={styles.mobileCardActions}>{renderActions(row)}</div>
                <div className={styles.mobileCardField}>
                  <span className={styles.mobileCardFieldLabel}>Date</span>
                  <span className={styles.cellText}>{row.date}</span>
                </div>
                <div className={styles.mobileCardField}>
                  <span className={styles.mobileCardFieldLabel}>Start</span>
                  <span className={styles.cellText}>{row.startTime}</span>
                </div>
                <div className={styles.mobileCardField}>
                  <span className={styles.mobileCardFieldLabel}>Duration</span>
                  <span className={styles.durationCell}>
                    {formatDuration(row.durationMinutes)}
                  </span>
                </div>
                <div className={styles.mobileCardField}>
                  <span className={styles.mobileCardFieldLabel}>Memo</span>
                  <span className={`${styles.cellText} ${styles.noteText}`}>
                    {row.note || '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow className={styles.headerRow}>
                  {SORTABLE_COLUMNS.map(col => (
                    <TableHead key={col.field} className={styles.headerCell}>
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
                  <TableHead className={styles.headerCell} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map(row => (
                  <TableRow key={row.id} className={styles.row}>
                    <TableCell className={styles.cell}>{renderNoteLink(row)}</TableCell>
                    <TableCell className={styles.cell}>
                      <span className={styles.cellText}>{row.date}</span>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <span className={styles.cellText}>{row.startTime}</span>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <span className={styles.durationCell}>
                        {formatDuration(row.durationMinutes)}
                      </span>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <span className={`${styles.cellText} ${styles.noteText}`}>
                        {row.note || '—'}
                      </span>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <div className={styles.actionButtons}>{renderActions(row)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageSizeGroup}>
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={v => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.pageInfo}>
              <span>
                {clampedPageIndex * pageSize + 1}–
                {Math.min((clampedPageIndex + 1) * pageSize, rows.length)} of{' '}
                {rows.length}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={clampedPageIndex === 0}
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={clampedPageIndex >= pageCount - 1}
                onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          !open && setEditDialog({ open: false, row: null, field: null, value: '' })
        }
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>{getEditDialogTitle()}</DialogTitle>
          </DialogHeader>
          {getEditDialogInput()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, row: null, field: null, value: '' })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
