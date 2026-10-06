import React, { useEffect, useState } from 'react';
import { Folder, Inbox, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { fetchFolders } from '../../api/requests/folders.requests';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
} from '../../api/dtos/folder.dtos';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (folder: FolderDto | null) => void;
  /** Folder ids that cannot be chosen (e.g. selected folders and their descendants). */
  disabledFolderIds?: ReadonlySet<number>;
  dialogTitle?: string;
  helperText?: string;
  /**
   * The note's current folder. After the folder list loads, the matching
   * folder is pre-selected (Root is pre-selected when null) and a helper
   * line shows the current location. When omitted (unknown), nothing is
   * pre-selected and "Move here" stays disabled until the user explicitly
   * picks a folder or Root.
   */
  currentFolderId?: number | null;
  /** Error message to display above the actions (dialog stays open). */
  error?: string | null;
};

export const MoveNoteDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  disabledFolderIds,
  dialogTitle = 'Move to folder',
  helperText,
  currentFolderId,
  error,
}) => {
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FolderDto | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!open) return;
    setSelected(currentFolderId === null ? null : undefined);
    setLoading(true);
    fetchFolders()
      .then(data => {
        setFolders(data);
        if (typeof currentFolderId === 'number') {
          const current = data.find(f => f.id === currentFolderId);
          if (current) setSelected(current);
        }
      })
      .finally(() => setLoading(false));
  }, [open, currentFolderId]);

  const tree = buildFolderTree(folders);
  const disabled = disabledFolderIds ?? new Set<number>();

  const currentFolder =
    currentFolderId != null
      ? (folders.find(f => f.id === currentFolderId) ?? null)
      : null;

  const derivedHelperText =
    !loading && currentFolderId != null
      ? currentFolder
        ? `Currently in: ${currentFolder.name}`
        : 'Current folder no longer exists — pick a new one'
      : null;

  const shownHelperText = derivedHelperText ?? helperText;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="gap-1 p-6 pb-2">
          <DialogTitle>{dialogTitle}</DialogTitle>
          {shownHelperText ? (
            <p className="text-xs text-muted-foreground">{shownHelperText}</p>
          ) : null}
        </DialogHeader>
        <div className="min-h-[200px] border-y border-border">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm hover:bg-accent',
                  selected === null && 'bg-accent'
                )}
              >
                <Inbox className="size-4 text-muted-foreground" />
                Root (no folder)
              </button>
              {tree.map(node => (
                <FolderPickerItem
                  key={node.id}
                  node={node}
                  depth={0}
                  selected={selected}
                  disabledFolderIds={disabled}
                  onSelect={setSelected}
                />
              ))}
              {tree.length === 0 && (
                <p className="px-4 py-4 text-xs text-muted-foreground">
                  No folders yet
                </p>
              )}
            </div>
          )}
        </div>
        {error ? (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}
        <DialogFooter className="p-6 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              selected === undefined ||
              (selected !== null && disabled.has(selected.id))
            }
            onClick={() => {
              if (selected !== undefined) onConfirm(selected);
            }}
          >
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type PickerItemProps = {
  node: FolderTreeNode;
  depth: number;
  selected: FolderDto | null | undefined;
  disabledFolderIds: ReadonlySet<number>;
  onSelect: (f: FolderDto) => void;
};

const FolderPickerItem: React.FC<PickerItemProps> = ({
  node,
  depth,
  selected,
  disabledFolderIds,
  onSelect,
}) => {
  const isDisabled = disabledFolderIds.has(node.id);
  const isSelected = selected?.id === node.id;
  return (
    <>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) onSelect(node);
        }}
        style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
        className={cn(
          'flex w-full items-center gap-2 py-1.5 pr-4 text-left text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
          isSelected && 'bg-accent'
        )}
      >
        <Folder className="size-4 text-muted-foreground" />
        {node.name}
      </button>
      {node.children.map(child => (
        <FolderPickerItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selected={selected}
          disabledFolderIds={disabledFolderIds}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};
