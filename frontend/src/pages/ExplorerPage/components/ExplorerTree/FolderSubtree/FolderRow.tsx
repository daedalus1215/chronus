import React, { useState } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FolderTreeNode } from '../../../../../api/dtos/folder.dtos';
import { DragMode } from '../ExplorerTree';
import { DropIntent } from '../useDragOperations';
import styles from '../ExplorerTree.module.css';

type FolderRowProps = {
  node: FolderTreeNode;
  depth: number;
  expanded: Set<number>;
  renaming: number | null;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  selected: boolean;
  pickItemsMode: boolean;
  dragMode: DragMode;
  dropIntent: DropIntent;
  dimmed?: boolean;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onRename: (id: number, currentName: string) => void;
  onFolderRowClick: (e: React.MouseEvent, folderId: number) => void;
  onChevronClick: (id: number) => void;
  onNewSubfolder: (parentId: number) => void;
  onNewMemoInFolder: (id: number) => void;
  onMoveToFolder: (id: number) => void;
  onDelete: (id: number) => void;
  onTogglePick: (id: number) => void;
};

export const FolderRow: React.FC<FolderRowProps> = React.memo(
  ({
    node,
    depth,
    expanded,
    renaming,
    renameValue,
    renameRef,
    selected,
    pickItemsMode,
    dragMode,
    dropIntent,
    dimmed = false,
    onRenameChange,
    onRenameCommit,
    onRenameCancel,
    onRename,
    onFolderRowClick,
    onChevronClick,
    onNewSubfolder,
    onNewMemoInFolder,
    onMoveToFolder,
    onDelete,
    onTogglePick,
  }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isOpen = expanded.has(node.id);
    const indent = 10 + depth * 16;
    const isDropTarget =
      dropIntent?.type === 'into' && dropIntent.overId === `folder-${node.id}`;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `folder-${node.id}`,
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

    return (
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: `${indent}px` }}
        className={cn(
          styles.row,
          selected && styles.rowActive,
          isDropTarget && styles.rowDropTarget,
          dimmed && styles.rowDimmed
        )}
        onClick={e => onFolderRowClick(e, node.id)}
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
              onCheckedChange={() => onTogglePick(node.id)}
              aria-label={`Select folder ${node.name}`}
            />
          </span>
        )}
        <span
          className={cn(styles.chevron, isOpen && styles.chevronOpen)}
          onClick={ev => {
            ev.stopPropagation();
            onChevronClick(node.id);
          }}
        >
          <ChevronRight size={14} />
        </span>
        <span className={styles.rowIcon}>
          {isOpen ? (
            <FolderOpen size={14} style={{ color: 'var(--color-text-secondary)' }} />
          ) : (
            <Folder size={14} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </span>

        {renaming === node.id ? (
          <Input
            ref={renameRef}
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') onRenameCommit();
              if (e.key === 'Escape') onRenameCancel();
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
            className={cn(styles.renameInput, 'h-5 flex-1')}
          />
        ) : (
          <span className={styles.label}>{node.name}</span>
        )}

        {renaming !== node.id && (
          <span className={styles.rowActions} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.actionBtn}
              title="New subfolder"
              onClick={() => onNewSubfolder(node.id)}
            >
              <FolderPlus size={13} />
            </button>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button type="button" className={styles.actionBtn}>
                  <MoreHorizontal size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                <DropdownMenuItem onClick={() => onMoveToFolder(node.id)}>
                  Move to folder…
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRename(node.id, node.name)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewSubfolder(node.id)}>
                  New subfolder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewMemoInFolder(node.id)}>
                  New memo
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(node.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        )}
      </div>
    );
  }
);
