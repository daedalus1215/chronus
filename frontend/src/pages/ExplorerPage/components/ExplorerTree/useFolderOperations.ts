import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildFolderTree,
  FolderDto,
} from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import {
  bulkReparentFolders,
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import { getNotesForExplorer, moveNoteToFolder, createNote } from '../../../../api/requests/notes.requests';
import { NOTE_TYPES } from '../../../../constant';
import {
  collectSubtreeIds,
  visibleFolderIdsInOrder,
} from './utils';

export const useFolderOperations = (
  selectedFolderIds: Set<number> = new Set()
) => {
  // Data state
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [notes, setNotes] = useState<ExplorerNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Dialog state
  const [newFolderParentId, setNewFolderParentId] = useState<number | null | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Rename state
  const [renaming, setRenaming] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  // Reparent target
  const [reparentTarget, setReparentTarget] = useState<{
    folderIds: number[];
    noteIds: number[];
  } | null>(null);

  // Data loading
  const load = useCallback(async () => {
    const [folderData, noteData] = await Promise.all([
      fetchFolders(),
      getNotesForExplorer(),
    ]);
    setFolders(folderData);
    setNotes(noteData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived data
  const tree = useMemo(() => buildFolderTree(folders), [folders]);
  const visibleFolderIds = useMemo(
    () => visibleFolderIdsInOrder(tree, expanded),
    [tree, expanded]
  );

  // Expand / collapse
  const toggle = useCallback((id: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }),
    []
  );

  // Create memo in selected folder (or root if none selected)
  const handleCreateMemo = useCallback(async () => {
    const folderId = selectedFolderIds.size > 0
      ? Math.min(...selectedFolderIds)
      : null;
    await createNote(NOTE_TYPES.MEMO, folderId);
    await load();
    if (folderId !== null) {
      setExpanded(prev => {
        const next = new Set(prev);
        next.add(folderId);
        return next;
      });
    }
  }, [selectedFolderIds, load]);

  // Create folder
  const handleCreateFolder = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const folder = await createFolder({ name: trimmed, parentId: newFolderParentId ?? null });
    setFolders(prev => [...prev, folder]);
    setExpanded(prev => {
      const next = new Set(prev);
      if (newFolderParentId) next.add(newFolderParentId);
      return next;
    });
    setNewFolderParentId(undefined);
  }, [newFolderParentId]);

  // Delete folder
  const handleDeleteFolder = useCallback(async () => {
    if (deleteConfirmId === null) return;
    await deleteFolder(deleteConfirmId);
    setFolders(prev => prev.filter(f => f.id !== deleteConfirmId));
    setNotes(prev => prev.map(n => (n.folderId === deleteConfirmId ? { ...n, folderId: null } : n)));
    setDeleteConfirmId(null);
  }, [deleteConfirmId]);

  // Rename
  const startRename = useCallback((id: number, currentName: string) => {
    setRenaming(id);
    setRenameValue(currentName);
    setTimeout(() => renameRef.current?.select(), 0);
  }, []);

  const commitRename = useCallback(async () => {
    if (renaming === null) return;
    const trimmed = renameValue.trim();
    if (trimmed) {
      const updated = await updateFolder(renaming, { name: trimmed });
      setFolders(prev => prev.map(f => (f.id === renaming ? updated : f)));
    }
    setRenaming(null);
  }, [renaming, renameValue]);

  // Reparent helpers
  const disabledMoveDestFolderIds = useMemo(() => {
    if (!reparentTarget || reparentTarget.folderIds.length === 0) return new Set<number>();
    const out = new Set<number>();
    reparentTarget.folderIds.forEach(id => {
      collectSubtreeIds(id, folders).forEach(x => out.add(x));
    });
    return out;
  }, [reparentTarget, folders]);

  const handleReparentConfirm = useCallback(async (folder: FolderDto | null) => {
    if (!reparentTarget) return;
    const dest = folder?.id ?? null;
    const { folderIds, noteIds } = reparentTarget;
    try {
      if (folderIds.length >= 2) {
        await bulkReparentFolders({ folderIds, parentId: dest });
      } else if (folderIds.length === 1) {
        await updateFolder(folderIds[0], { parentId: dest });
      }
      if (noteIds.length > 0) {
        await Promise.all(noteIds.map(id => moveNoteToFolder(id, dest)));
      }
      await load();
    } finally {
      setReparentTarget(null);
    }
  }, [reparentTarget, load]);

  return {
    // Data
    folders,
    notes,
    loading,
    tree,
    visibleFolderIds,

    // Dialogs
    newFolderParentId,
    setNewFolderParentId,
    deleteConfirmId,
    setDeleteConfirmId,
    handleCreateMemo,
    handleCreateFolder,
    handleDeleteFolder,

    // Rename
    renaming,
    renameValue,
    renameRef,
    setRenameValue,
    startRename,
    commitRename,

    // Expand
    expanded,
    toggle,

    // Reparent
    reparentTarget,
    setReparentTarget,
    disabledMoveDestFolderIds,
    handleReparentConfirm,
  };
};
