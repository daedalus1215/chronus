import { useMemo, useState, useCallback, useRef } from 'react';
import { useTagsWithNotes } from '../../hooks/useTagsWithNotes';
import { buildTagTreeItems, type TagTreeItem } from './tagTreeItems';

export const useTagTreeItems = (): {
  treeItems: TagTreeItem[];
  isLoading: boolean;
  error: string | null;
  loadNotesForTag: (tagId: number) => Promise<void>;
  refreshNotesForTag: (tagId: number) => Promise<void>;
} => {
  const { tags, tagsLoading, tagsError, fetchNotesForTag } = useTagsWithNotes();
  const [notesByTagId, setNotesByTagId] = useState<
    Record<number, { id: number; name: string; pinned?: boolean }[]>
  >({});
  const [loadedTagIds, setLoadedTagIds] = useState<Set<number>>(new Set());
  const inFlightTagIds = useRef<Set<number>>(new Set());

  const loadNotesForTag = useCallback(
    async (tagId: number) => {
      if (loadedTagIds.has(tagId) || inFlightTagIds.current.has(tagId)) return;
      inFlightTagIds.current.add(tagId);
      try {
        const notes = await fetchNotesForTag(tagId);
        setNotesByTagId(prev => ({ ...prev, [tagId]: notes }));
        setLoadedTagIds(prev => new Set(prev).add(tagId));
      } finally {
        inFlightTagIds.current.delete(tagId);
      }
    },
    [loadedTagIds, fetchNotesForTag]
  );

  const refreshNotesForTag = useCallback(
    async (tagId: number) => {
      const notes = await fetchNotesForTag(tagId);
      setNotesByTagId(prev => ({ ...prev, [tagId]: notes }));
      setLoadedTagIds(prev => new Set(prev).add(tagId));
    },
    [fetchNotesForTag]
  );

  const treeItems = useMemo(
    () => buildTagTreeItems(tags, notesByTagId, loadedTagIds),
    [tags, notesByTagId, loadedTagIds]
  );

  const isLoading = tagsLoading;
  const error = tagsError ? 'Failed to load tags' : null;

  return { treeItems, isLoading, error, loadNotesForTag, refreshNotesForTag };
};
