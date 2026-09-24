import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildFolderTree, FolderDto } from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import {
  bulkReparentFolders,
  createFolder,
  deleteFolder,
  fetchFolders,
  updateFolder,
} from '../../../../api/requests/folders.requests';
import {
  getNotesForExplorer,
  moveNoteToFolder,
  createNote,
} from '../../../../api/requests/notes.requests';
import { NOTE_TYPES } from '../../../../constant';
import { collectSubtreeIds, visibleFolderIdsInOrder } from './utils';
import { STORAGE_KEYS } from '../../../../constants/storage';

/**
 * Restore the folder expansion state from localStorage.
 * Returns an empty set when nothing is stored or the stored value is
 * malformed, so a corrupted entry never breaks the tree.
 */
const readStoredExpanded = (): Set<number> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPLORER.EXPANDED_FOLDERS);
    if (stored === null) return new Set();
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter(
        (v): v is number => typeof v === 'number' && Number.isFinite(v)
      )
    );
  } catch {
    return new Set();
  }
};

export const useFolderOperations = (
  selectedFolderIds: Set<number> = new Set()
) => {
  // Data state
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [notes, setNotes] = useState<ExplorerNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(readStoredExpanded);

  // Dialog state
  const [newFolderParentId, setNewFolderParentId] = useState<
    number | null | undefined
  >(undefined);
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

  // Persist expansion state so it is retained when leaving the page
  // (component unmount) and across reloads.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.EXPLORER.EXPANDED_FOLDERS,
      JSON.stringify([...expanded])
    );
  }, [expanded]);

  // Drop IDs for folders that no longer exist so deleted folders do not
  // accumulate in the stored set.
  useEffect(() => {
    if (loading) return;
    const validIds = new Set(folders.map(f => f.id));
    setExpanded(prev => {
      const hasStale = [...prev].some(id => !validIds.has(id));
      if (!hasStale) return prev;
      return new Set([...prev].filter(id => validIds.has(id)));
    });
  }, [loading, folders]);

  // Derived data
  const tree = useMemo(() => buildFolderTree(folders), [folders]);
  const visibleFolderIds = useMemo(
    () => visibleFolderIdsInOrder(tree, expanded),
    [tree, expanded]
  );

  // Expand / collapse
  const toggle = useCallback(
    (id: number) =>
      setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    []
  );

  // Create memo in selected folder (or root if none selected)
  const handleCreateMemo = useCallback(async () => {
    const folderId =
      selectedFolderIds.size > 0 ? Math.min(...selectedFolderIds) : null;
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

  const handleCreateMemoInFolder = useCallback(
    async (folderId: number) => {
      await createNote(NOTE_TYPES.MEMO, folderId);
      await load();
      setExpanded(prev => {
        const next = new Set(prev);
        next.add(folderId);
        return next;
      });
    },
    [load]
  );

  // Create folder
  const handleCreateFolder = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const folder = await createFolder({
        name: trimmed,
        parentId: newFolderParentId ?? null,
      });
      setFolders(prev => [...prev, folder]);
      setExpanded(prev => {
        const next = new Set(prev);
        if (newFolderParentId) next.add(newFolderParentId);
        return next;
      });
      setNewFolderParentId(undefined);
    },
    [newFolderParentId]
  );

  // Delete folder
  const handleDeleteFolder = useCallback(async () => {
    if (deleteConfirmId === null) return;
    await deleteFolder(deleteConfirmId);
    setFolders(prev => prev.filter(f => f.id !== deleteConfirmId));
    setNotes(prev =>
      prev.map(n =>
        n.folderId === deleteConfirmId ? { ...n, folderId: null } : n
      )
    );
    setDeleteConfirmId(null);
  }, [deleteConfirmId]);

  // Rename
  const startRename = useCallback((id: number, currentName: string) => {
    setRenaming(id);
    setRenameValue(currentName);
    setTimeout(() => renameRef.current?.select(), 0);
  }, []);

  const cancelRename = useCallback(() => setRenaming(null), []);

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
    if (!reparentTarget || reparentTarget.folderIds.length === 0)
      return new Set<number>();
    const out = new Set<number>();
    reparentTarget.folderIds.forEach(id => {
      collectSubtreeIds(id, folders).forEach(x => out.add(x));
    });
    return out;
  }, [reparentTarget, folders]);

  const handleReparentConfirm = useCallback(
    async (folder: FolderDto | null) => {
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
    },
    [reparentTarget, load]
  );

  return {
    // Data
    folders,
    setFolders,
    notes,
    setNotes,
    loading,
    tree,
    visibleFolderIds,

    // Dialogs
    newFolderParentId,
    setNewFolderParentId,
    deleteConfirmId,
    setDeleteConfirmId,
    handleCreateMemo,
    handleCreateMemoInFolder,
    handleCreateFolder,
    handleDeleteFolder,

    // Rename
    renaming,
    renameValue,
    renameRef,
    setRenameValue,
    startRename,
    commitRename,
    cancelRename,

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
