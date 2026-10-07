import React, { useState } from 'react';
import { StickyNote, SquareCheck, MoreHorizontal, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import { DragMode } from './ExplorerTree';
import styles from './ExplorerTree.module.css';

type NoteRowProps = {
  note: ExplorerNoteItem;
  depth: number;
  active: boolean;
  selected: boolean;
  pickItemsMode: boolean;
  dragMode: DragMode;
  onOpen: (id: number) => void;
  onRowClick: (
    e: React.MouseEvent,
    noteId: number,
    openNote: () => void
  ) => void;
  onOpenBoard: (id: number) => void;
  onMoveToFolder: (id: number) => void;
  onTogglePick: () => void;
  isMatch?: boolean;
  filterActive?: boolean;
};

export const NoteRow: React.FC<NoteRowProps> = React.memo(
  ({
    note,
    depth,
    active,
    selected,
    pickItemsMode,
    dragMode,
    onOpen,
    onRowClick,
    onOpenBoard,
    onMoveToFolder,
    onTogglePick,
    isMatch = false,
    filterActive = false,
  }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const indent = 10 + depth * 16 + 14;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `note-${note.id}`,
      disabled: dragMode === 'off',
    });

    const style =
      dragMode !== 'off'
        ? {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.4 : 1,
          }
        : undefined;

    // A note is dimmed only if filter is active AND the note itself does NOT match
    const dimmed = filterActive && !isMatch;

    return (
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: `${indent}px` }}
        className={cn(
          styles.row,
          (active || selected) && styles.rowActive,
          dimmed && styles.rowDimmed
        )}
        onClick={e => onRowClick(e, note.id, () => onOpen(note.id))}
      >
        {dragMode !== 'off' && (
          <span
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={13} style={{ color: 'var(--color-text-muted)' }} />
          </span>
        )}
        {pickItemsMode && (
          <span className={styles.rowCheck} onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => onTogglePick()}
              aria-label={`Select note ${note.name}`}
            />
          </span>
        )}
        <span className={styles.rowIcon}>
          {note.isMemo ? (
            <StickyNote size={13} style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <SquareCheck size={13} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </span>
        <span className={cn(styles.label, active && styles.labelActive)}>
          {note.name}
        </span>
        <span className={styles.rowActions} onClick={e => e.stopPropagation()}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={styles.actionBtn}>
                <MoreHorizontal size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => onOpen(note.id)}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenBoard(note.id)}>
                Board
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoveToFolder(note.id)}>
                Move to folder…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>
    );
  }
);
