import React, { useEffect, useState } from 'react';
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
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { MoveNoteDialog } from '@components/MoveNoteDialog/MoveNoteDialog';

type ExplorerTreeDialogsProps = {
  // New folder dialog
  newFolderParentId: number | null | undefined;
  setNewFolderParentId: (v: number | null | undefined) => void;
  handleCreateFolder: (name: string) => void;

  // Delete dialog
  deleteConfirmId: number | null;
  setDeleteConfirmId: (v: number | null) => void;
  handleDeleteFolder: () => void;

  // Reparent dialog
  reparentTarget: { folderIds: number[]; noteIds: number[] } | null;
  setReparentTarget: (
    v: { folderIds: number[]; noteIds: number[] } | null
  ) => void;
  handleReparentConfirm: (folder: FolderDto | null) => void;
  disabledMoveDestFolderIds: Set<number>;
};

export const ExplorerTreeDialogs: React.FC<ExplorerTreeDialogsProps> = ({
  newFolderParentId,
  setNewFolderParentId,
  handleCreateFolder,
  deleteConfirmId,
  setDeleteConfirmId,
  handleDeleteFolder,
  reparentTarget,
  setReparentTarget,
  handleReparentConfirm,
  disabledMoveDestFolderIds,
}) => {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (newFolderParentId === undefined) setFolderName('');
  }, [newFolderParentId]);

  return (
    <>
      {/* New folder dialog */}
      <Dialog
        open={newFolderParentId !== undefined}
        onOpenChange={(open) => !open && setNewFolderParentId(undefined)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="explorer-new-folder-name">Folder name</Label>
            <Input
              id="explorer-new-folder-name"
              autoFocus
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder(folderName)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderParentId(undefined)}>
              Cancel
            </Button>
            <Button
              disabled={!folderName.trim()}
              onClick={() => handleCreateFolder(folderName)}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deletes this folder and all subfolders. Notes inside return to root.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to folder dialog */}
      {reparentTarget !== null && (
        <MoveNoteDialog
          open
          onClose={() => setReparentTarget(null)}
          onConfirm={handleReparentConfirm}
          disabledFolderIds={disabledMoveDestFolderIds}
          dialogTitle={
            reparentTarget.folderIds.length + reparentTarget.noteIds.length > 1
              ? `Move ${reparentTarget.folderIds.length + reparentTarget.noteIds.length} items`
              : 'Move to folder'
          }
          helperText={
            reparentTarget.folderIds.length >= 2
              ? 'If you selected a folder and its subfolders, only the top folder is moved; children stay attached.'
              : undefined
          }
        />
      )}
    </>
  );
};
