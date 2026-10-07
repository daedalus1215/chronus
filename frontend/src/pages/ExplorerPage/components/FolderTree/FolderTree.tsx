import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, FolderPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  buildFolderTree,
  FolderDto,
  FolderTreeNode,
} from '../../../../api/dtos/folder.dtos';
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import { FolderTreeItem } from './FolderTreeItem';
import styles from './FolderTree.module.css';

type Props = {
  selectedId: number | null;
  onSelect: (id: number | null, name?: string) => void;
};

export const FolderTree: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderDialog, setNewFolderDialog] = useState<{
    open: boolean;
    parentId: number | null;
  }>({ open: false, parentId: null });
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = useCallback(async () => {
    const data = await fetchFolders();
    setFolders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateOpen = (parentId: number | null) => {
    setNewFolderName('');
    setNewFolderDialog({ open: true, parentId });
  };

  const handleCreateConfirm = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const folder = await createFolder({
      name,
      parentId: newFolderDialog.parentId,
    });
    setFolders(prev => [...prev, folder]);
    setNewFolderDialog({ open: false, parentId: null });
  };

  const handleRename = async (id: number, newName: string) => {
    const updated = await updateFolder(id, { name: newName });
    setFolders(prev => prev.map(f => (f.id === id ? updated : f)));
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm === null) return;
    await deleteFolder(deleteConfirm);
    setFolders(prev => prev.filter(f => f.id !== deleteConfirm));
    if (selectedId === deleteConfirm) onSelect(null);
    setDeleteConfirm(null);
  };

  const tree: FolderTreeNode[] = buildFolderTree(folders);

  return (
    <div className={styles.tree}>
      <div className={styles.treeHeader}>
        <span className={styles.heading}>Folders</span>
        <button
          type="button"
          onClick={() => handleCreateOpen(null)}
          title="New folder"
          className={styles.headerBtn}
        >
          <FolderPlus size={16} />
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div>
          <div
            role="button"
            tabIndex={0}
            aria-selected={selectedId === null}
            onClick={() => onSelect(null, 'All Notes')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(null, 'All Notes');
              }
            }}
            className={styles.item}
            style={{ paddingLeft: '10px' }}
          >
            <span className={styles.chevron} />
            <span className={styles.icon}>
              <Inbox
                size={14}
                className={selectedId === null ? 'text-primary' : undefined}
                style={
                  selectedId !== null
                    ? { color: 'var(--color-text-muted)' }
                    : undefined
                }
              />
            </span>
            <span
              className={cn(styles.label, selectedId === null && styles.labelSelected)}
            >
              All Notes
            </span>
          </div>

          {tree.map(node => (
            <FolderTreeItem
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={handleCreateOpen}
              onRename={handleRename}
              onDelete={id => setDeleteConfirm(id)}
            />
          ))}

          {tree.length === 0 && (
            <div className="px-4 py-2">
              <span className="text-xs text-muted-foreground">No folders yet</span>
            </div>
          )}
        </div>
      )}

      {/* New folder dialog */}
      <Dialog
        open={newFolderDialog.open}
        onOpenChange={(open) => !open && setNewFolderDialog({ open: false, parentId: null })}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-folder-name">Folder name</Label>
            <Input
              id="new-folder-name"
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateConfirm()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewFolderDialog({ open: false, parentId: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConfirm} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will delete the folder and all subfolders. Notes inside will
            move to root. Continue?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
