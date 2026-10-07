import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import styles from './TagTreeNavigation.module.css';
import { CustomTagTreeItem } from './CustomTagTreeItem';
import {
  TAG_PREFIX,
  filterTagTreeItems,
  parseNoteId,
  type TagTreeItem,
} from './tagTreeItems';
import { useTagTreeItems } from './useTagTreeItems';

export type { TagTreeItem } from './tagTreeItems';

type TagTreeNavigationProps = {
  /** When set, tree is filtered to tags/notes whose label contains this (case-insensitive). */
  searchQuery?: string;
};

export const TagTreeNavigation: React.FC<TagTreeNavigationProps> = ({
  searchQuery = '',
}) => {
  const navigate = useNavigate();
  const {
    treeItems,
    isLoading,
    error,
    loadNotesForTag,
    refreshNotesForTag,
  } = useTagTreeItems();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = useMemo(
    () => filterTagTreeItems(treeItems, searchQuery),
    [treeItems, searchQuery]
  );
  // Pinned state is injected via a per-item lookup keyed by item id, since
  // it lives one level up from the note node itself in the source data.
  const pinnedByItemId = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const tag of treeItems) {
      for (const child of tag.children ?? []) {
        if (child.type === 'note') {
          map[child.id] = Boolean(child.pinned);
        }
      }
    }
    return map;
  }, [treeItems]);

  // Tag rows get their metadata (name, note count) via a per-item lookup,
  // same pattern as pinned state above.
  const tagMetaByItemId = useMemo(() => {
    const map: Record<string, { name: string; noteCount: number }> = {};
    for (const tag of treeItems) {
      if (tag.type === 'tag') {
        map[tag.id] = { name: tag.label, noteCount: tag.noteCount ?? 0 };
      }
    }
    return map;
  }, [treeItems]);

  const toggleExpanded = (itemId: string) => {
    const isExpanding = !expandedItems.includes(itemId);
    setExpandedItems(prev =>
      isExpanding ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
    if (isExpanding && itemId.startsWith(TAG_PREFIX)) {
      loadNotesForTag(Number(itemId.slice(TAG_PREFIX.length)));
    }
  };

  const handleItemClick = (itemId: string) => {
    if (itemId.startsWith(TAG_PREFIX)) {
      toggleExpanded(itemId);
      const tagId = itemId.slice(TAG_PREFIX.length);
      navigate(ROUTES.TAG_NOTES(tagId), { replace: true });
      return;
    }
    const parsed = parseNoteId(itemId);
    if (parsed) {
      navigate(`${ROUTES.TAG_NOTES(parsed.tagId)}/notes/${parsed.noteId}`, {
        replace: true,
      });
    }
  };

  const renderItems = (items: TagTreeItem[], depth: number): React.ReactNode => (
    <ul role={depth === 0 ? 'tree' : 'group'} className={depth > 0 ? styles.childrenGroup : undefined}>
      {items.map(item => (
        <li key={item.id} role="none">
          <CustomTagTreeItem
            item={item}
            isExpanded={expandedItems.includes(item.id)}
            pinned={pinnedByItemId[item.id] ?? false}
            tagMeta={tagMetaByItemId[item.id]}
            onClick={() => handleItemClick(item.id)}
            onNotePinned={(_noteId: number, tagId: number) =>
              refreshNotesForTag(tagId)
            }
          />
          {item.children && item.children.length > 0 && expandedItems.includes(item.id)
            ? renderItems(item.children, depth + 1)
            : null}
        </li>
      ))}
    </ul>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  if (treeItems.length === 0) {
    return <div className="p-4 text-muted-foreground">No tags yet</div>;
  }

  if (filteredItems.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No matching tags or notes</div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.treeWrapper}>{renderItems(filteredItems, 0)}</div>
    </div>
  );
};
