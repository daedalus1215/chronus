import React from 'react';
import {
  FileOutput,
  X,
  FolderPlus,
  ListChecks,
  FilePlus,
  ArrowDownUp,
  Search,
  GitMerge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import styles from './ExplorerTree.module.css';
import { DragMode } from './ExplorerTree';

type ExplorerTreeHeaderProps = {
  selectionCount: number;
  pickItemsMode: boolean;
  dragMode: DragMode;
  canMerge: boolean;
  onMoveSelected: () => void;
  onMergeSelected: () => void;
  onClearSelection: () => void;
  onTogglePickItems: () => void;
  onCycleDragMode: () => void;
  onNewFolder: () => void;
  onNewMemo: () => void;
  onToggleFilter: () => void;
};

export const ExplorerTreeHeader: React.FC<ExplorerTreeHeaderProps> = ({
  selectionCount,
  pickItemsMode,
  dragMode,
  canMerge,
  onMoveSelected,
  onMergeSelected,
  onClearSelection,
  onTogglePickItems,
  onCycleDragMode,
  onNewFolder,
  onNewMemo,
  onToggleFilter,
}) => {
  const dragTitle = dragMode === 'off' ? 'Enter drag mode' : 'Exit drag mode';

  return (
    <div className={styles.header}>
      <div className={cn(styles.headerActions, 'flex shrink-0 items-center gap-1')}>
        <button
          type="button"
          className={styles.headerBtn}
          title="Filter (Ctrl+.)"
          onClick={onToggleFilter}
        >
          <Search size={14} />
        </button>
        <span className={styles.headerSep} />
        {selectionCount > 0 && (
          <>
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px]"
              style={{ color: 'var(--color-text-muted)', maxWidth: 90 }}
            >
              {selectionCount}
            </span>
            <button
              type="button"
              className={styles.headerBtn}
              title="Move to folder (Ctrl+M)"
              onClick={onMoveSelected}
            >
              <FileOutput size={14} />
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <button
                    type="button"
                    className={styles.headerBtn}
                    title="Merge notes"
                    onClick={onMergeSelected}
                    disabled={!canMerge}
                  >
                    <GitMerge size={14} />
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Merge selected notes (need 2+ memos or 2+ checklists)
              </TooltipContent>
            </Tooltip>
            <button
              type="button"
              className={styles.headerBtn}
              title="Clear selection"
              onClick={onClearSelection}
            >
              <X size={14} />
            </button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          title={
            pickItemsMode
              ? 'Exit select mode (clears selection)'
              : 'Select notes & folders to move'
          }
          aria-pressed={pickItemsMode}
          onClick={onTogglePickItems}
          className="h-auto shrink-0 whitespace-nowrap px-1.5 py-0.5 text-[11px]"
          style={{
            color: pickItemsMode ? 'var(--color-text)' : 'var(--color-text-muted)',
            backgroundColor: pickItemsMode ? 'var(--color-overlay-stronger)' : 'transparent',
          }}
        >
          <ListChecks className="size-4 opacity-85" />
        </Button>
        <button
          type="button"
          className={styles.headerBtn}
          title={dragTitle}
          aria-pressed={dragMode !== 'off'}
          onClick={onCycleDragMode}
          style={{ color: dragMode !== 'off' ? 'var(--color-text)' : undefined }}
        >
          <ArrowDownUp size={14} />
        </button>
        <button
          type="button"
          className={styles.headerBtn}
          title="New folder"
          onClick={onNewFolder}
        >
          <FolderPlus size={14} />
        </button>
        <button
          type="button"
          className={styles.headerBtn}
          title="New memo"
          onClick={onNewMemo}
        >
          <FilePlus size={14} />
        </button>
      </div>
    </div>
  );
};
