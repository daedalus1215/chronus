import { useCallback, useRef, useState } from 'react';
import { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import { reorderFolders, updateFolder } from '../../../../api/requests/folders.requests';
import { moveNoteToFolder, reorderNotes } from '../../../../api/requests/notes.requests';

export type DropIntent = { type: 'reorder' | 'into'; overId: string } | null;

type UseDragOperationsProps = {
  folders: FolderDto[];
  notes: ExplorerNoteItem[];
  setFolders: React.Dispatch<React.SetStateAction<FolderDto[]>>;
  setNotes: React.Dispatch<React.SetStateAction<ExplorerNoteItem[]>>;
};

function parseItemId(dndId: string): { type: 'folder' | 'note'; id: number } {
  if (dndId.startsWith('folder-')) return { type: 'folder', id: parseInt(dndId.slice(7), 10) };
  return { type: 'note', id: parseInt(dndId.slice(5), 10) };
}

export const useDragOperations = ({ folders, notes, setFolders, setNotes }: UseDragOperationsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropIntent, setDropIntent] = useState<DropIntent>(null);
  // Ref so onDragEnd reads the latest value synchronously without stale closure
  const dropIntentRef = useRef<DropIntent>(null);

  const updateIntent = (intent: DropIntent) => {
    if (intent?.type === dropIntentRef.current?.type &&
        intent?.overId === dropIntentRef.current?.overId) return;
    setDropIntent(intent);
    dropIntentRef.current = intent;
  };

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    updateIntent(null);
  }, []);

  const onDragCancel = useCallback(() => {
    setActiveId(null);
    updateIntent(null);
  }, []);

  const onDragMove = useCallback((event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) { updateIntent(null); return; }

    const overId = over.id as string;

    // Notes can't receive reparent drops
    if (!overId.startsWith('folder-')) {
      updateIntent({ type: 'reorder', overId });
      return;
    }

    const activeRect = active.rect.current.translated;
    if (!activeRect) { updateIntent({ type: 'reorder', overId }); return; }

    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = over.rect.top + over.rect.height / 2;
    const inMiddle = Math.abs(activeCenterY - overCenterY) <= over.rect.height * 0.25;

    updateIntent({ type: inMiddle ? 'into' : 'reorder', overId });
  }, []);

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    const intent = dropIntentRef.current;
    setActiveId(null);
    updateIntent(null);

    const { active, over } = event;
    if (!over || active.id === over.id || !intent) return;

    const activeStr = active.id as string;
    const activeItem = parseItemId(activeStr);

    // ── Reparent into folder ────────────────────────────────────────
    if (intent.type === 'into') {
      const targetFolderId = parseInt(intent.overId.slice(7), 10);
      if (activeItem.type === 'folder' && activeItem.id === targetFolderId) return;

      if (activeItem.type === 'folder') {
        const snapshot = folders;
        setFolders(prev => prev.map(f =>
          f.id === activeItem.id ? { ...f, parentId: targetFolderId } : f
        ));
        try {
          await updateFolder(activeItem.id, { parentId: targetFolderId });
        } catch {
          setFolders(snapshot);
        }
      } else {
        const snapshot = notes;
        setNotes(prev => prev.map(n =>
          n.id === activeItem.id ? { ...n, folderId: targetFolderId } : n
        ));
        try {
          await moveNoteToFolder(activeItem.id, targetFolderId);
        } catch {
          setNotes(snapshot);
        }
      }
      return;
    }

    // ── Reorder within same parent ──────────────────────────────────
    const overItem = parseItemId(intent.overId);

    if (activeItem.type === 'folder' && overItem.type === 'folder') {
      const activeFolder = folders.find(f => f.id === activeItem.id);
      const overFolder = folders.find(f => f.id === overItem.id);
      if (!activeFolder || !overFolder || activeFolder.parentId !== overFolder.parentId) return;

      const parentId = activeFolder.parentId;
      const siblings = folders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const oldIdx = siblings.findIndex(f => f.id === activeItem.id);
      const newIdx = siblings.findIndex(f => f.id === overItem.id);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove(siblings, oldIdx, newIdx);
      const items = reordered.map((f, i) => ({ id: f.id, sortOrder: i }));
      const snapshot = folders;
      setFolders(prev => {
        const next = [...prev];
        items.forEach(({ id, sortOrder }) => {
          const i = next.findIndex(f => f.id === id);
          if (i !== -1) next[i] = { ...next[i], sortOrder };
        });
        return next;
      });
      try { await reorderFolders({ items, parentId }); }
      catch { setFolders(snapshot); }
      return;
    }

    if (activeItem.type === 'note' && overItem.type === 'note') {
      const activeNote = notes.find(n => n.id === activeItem.id);
      const overNote = notes.find(n => n.id === overItem.id);
      if (!activeNote || !overNote || activeNote.folderId !== overNote.folderId) return;

      const folderId = activeNote.folderId;
      const siblings = notes
        .filter(n => n.folderId === folderId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const oldIdx = siblings.findIndex(n => n.id === activeItem.id);
      const newIdx = siblings.findIndex(n => n.id === overItem.id);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove(siblings, oldIdx, newIdx);
      const items = reordered.map((n, i) => ({ id: n.id, sortOrder: i }));
      const snapshot = notes;
      setNotes(prev => {
        const next = [...prev];
        items.forEach(({ id, sortOrder }) => {
          const i = next.findIndex(n => n.id === id);
          if (i !== -1) next[i] = { ...next[i], sortOrder };
        });
        return next;
      });
      try { await reorderNotes({ items, folderId }); }
      catch { setNotes(snapshot); }
    }
  }, [folders, notes, setFolders, setNotes]);

  return { activeId, dropIntent, onDragStart, onDragCancel, onDragMove, onDragEnd };
};
