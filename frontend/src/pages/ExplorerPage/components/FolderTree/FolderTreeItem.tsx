import React, { useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  FolderPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FolderTreeNode } from '../../../../api/dtos/folder.dtos';
import styles from './FolderTree.module.css';

type Props = {
  node: FolderTreeNode;
  depth: number;
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
  onCreateChild: (parentId: number | null) => void;
  onRename: (id: number, newName: string) => Promise<void>;
  onDelete: (id: number) => void;
};

export const FolderTreeItem: React.FC<Props> = ({
  node,
  depth,
  selectedId,
  onSelect,
  onCreateChild,
  onRename,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const handleSelect = () => {
    onSelect(node.id, node.name);
    if (hasChildren) setExpanded(true);
  };

  const handleRenameStart = () => {
    setMenuOpen(false);
    setRenameValue(node.name);
    setRenaming(true);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const handleRenameCommit = async () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) await onRename(node.id, trimmed);
    setRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameCommit();
    if (e.key === 'Escape') setRenaming(false);
  };

  const indentPx = 10 + depth * 16;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        onClick={handleSelect}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        }}
        className={styles.item}
        style={{ paddingLeft: `${indentPx}px` }}
      >
        {/* chevron */}
        <span className={styles.chevron} onClick={handleToggle}>
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : null}
        </span>

        {/* folder icon */}
        <span className={styles.icon}>
          {expanded || isSelected ? (
            <FolderOpen
              size={14}
              className={isSelected ? 'text-primary' : undefined}
              style={!isSelected ? { color: 'var(--color-text-muted)' } : undefined}
            />
          ) : (
            <Folder size={14} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </span>

        {/* label or inline rename */}
        {renaming ? (
          <Input
            ref={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={handleRenameKeyDown}
            onClick={e => e.stopPropagation()}
            autoFocus
            className={cn(styles.renameInput, 'h-5 flex-1')}
          />
        ) : (
          <span
            className={cn(styles.label, isSelected && styles.labelSelected)}
          >
            {node.name}
          </span>
        )}

        {/* hover actions */}
        {!renaming && (
          <span className={styles.itemActions} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={e => {
                onCreateChild(node.id);
                e.stopPropagation();
              }}
              title="New subfolder"
            >
              <FolderPlus size={13} />
            </button>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[140px]"
                onClick={e => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleRenameStart}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(node.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        )}
      </div>

      {expanded &&
        node.children.map(child => (
          <FolderTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            onCreateChild={onCreateChild}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};
