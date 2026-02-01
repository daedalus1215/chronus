import { useEffect, useMemo, useState } from 'react';
import { useTagsWithNotes } from '../../hooks/useTagsWithNotes';
import {
  buildTagTreeItems,
  type TagTreeItem,
} from './tagTreeItems';

export const useTagTreeItems = (): {
  treeItems: TagTreeItem[];
  isLoading: boolean;
  error: string | null;
} => {
  const { tags, tagsLoading, tagsError, fetchNotesForTag } = useTagsWithNotes();
  const [notesByTagId, setNotesByTagId] = useState<
    Record<number, { id: number; name: string }[]>
  >({});
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    if (tags.length === 0) {
      setNotesLoading(false);
      return;
    }
    let cancelled = false;
    setNotesLoading(true);
    Promise.all(
      tags.map((tag) =>
        fetchNotesForTag(tag.id).then((notes) => ({ tagId: tag.id, notes }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<number, { id: number; name: string }[]> = {};
        results.forEach(({ tagId, notes }) => {
          map[tagId] = notes;
        });
        setNotesByTagId(map);
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tags, fetchNotesForTag]);

  const treeItems = useMemo(
    () => buildTagTreeItems(tags, notesByTagId),
    [tags, notesByTagId]
  );

  const isLoading = tagsLoading || notesLoading;
  const error = tagsError ? 'Failed to load tags' : null;

  return { treeItems, isLoading, error };
};
