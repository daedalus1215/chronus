import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
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
  const { treeItems, isLoading, error } = useTagTreeItems();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = useMemo(
    () => filterTagTreeItems(treeItems, searchQuery),
    [treeItems, searchQuery]
  );

  const handleItemClick = (_event: React.MouseEvent, itemId: string) => {
    if (itemId.startsWith(TAG_PREFIX)) {
      setExpandedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
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
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  if (treeItems.length === 0) {
    return (
      <Box sx={{ p: 2, color: 'text.secondary' }}>
        No tags yet
      </Box>
    );
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
      <Box
        className={styles.treeWrapper}
      >
        <RichTreeView<TagTreeItem>
          items={filteredItems}
          getItemId={(item) => item.id}
          getItemLabel={getTagTreeItemLabel}
          getItemChildren={(item) => item.children ?? []}
          onItemClick={handleItemClick}
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          selectedItems={selectedItems}
          itemChildrenIndentation={0}
          slots={{
            item: CustomTagTreeItem,
          }}
        />
      </Box>
    </Box>
  );
};
