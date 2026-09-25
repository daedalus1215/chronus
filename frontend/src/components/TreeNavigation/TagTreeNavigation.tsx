import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ROUTES } from '../../constants/routes';
import styles from './TagTreeNavigation.module.css';
import { CustomTagTreeItem } from './CustomTagTreeItem';
import {
  TAG_PREFIX,
  filterTagTreeItems,
  getTagTreeItemLabel,
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
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
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
  // The tree only passes label/id/itemId to the item slot, so pinned state
  // is injected via a per-item lookup keyed by item id.
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

  const TreeItemWithPin = useCallback(
    (itemProps: TreeItemProps) => (
      <CustomTagTreeItem
        {...itemProps}
        pinned={pinnedByItemId[itemProps.itemId] ?? false}
        onNotePinned={(_noteId: number, tagId: number) =>
          refreshNotesForTag(tagId)
        }
      />
    ),
    [pinnedByItemId, refreshNotesForTag]
  );

  const handleItemClick = (_event: React.MouseEvent, itemId: string) => {
    if (itemId.startsWith(TAG_PREFIX)) {
      const isExpanding = !expandedItems.includes(itemId);
      setExpandedItems(prev =>
        isExpanding ? [...prev, itemId] : prev.filter(id => id !== itemId)
      );
      if (isExpanding) {
        loadNotesForTag(Number(itemId.slice(TAG_PREFIX.length)));
      }
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

  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent | null,
    itemIds: string[]
  ) => {
    itemIds
      .filter(id => id.startsWith(TAG_PREFIX) && !expandedItems.includes(id))
      .forEach(id => loadNotesForTag(Number(id.slice(TAG_PREFIX.length))));
    setExpandedItems(itemIds);
  };

  const selectedItems = useMemo((): string | null => {
    if (routeTagId) {
      return `${TAG_PREFIX}${routeTagId}`;
    }
    return null;
  }, [routeTagId]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>;
  }

  if (treeItems.length === 0) {
    return <Box sx={{ p: 2, color: 'text.secondary' }}>No tags yet</Box>;
  }

  if (filteredItems.length === 0) {
    return (
      <Box sx={{ p: 2, color: 'text.secondary' }}>
        No matching tags or notes
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.treeWrapper}>
        <RichTreeView<TagTreeItem>
          items={filteredItems}
          getItemId={item => item.id}
          getItemLabel={getTagTreeItemLabel}
          getItemChildren={item => item.children ?? []}
          onItemClick={handleItemClick}
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          selectedItems={selectedItems}
          itemChildrenIndentation={0}
          slots={{
            item: TreeItemWithPin,
          }}
        />
      </Box>
    </Box>
  );
};
