import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import { ROUTES } from '../../constants/routes';
import styles from './TagTreeNavigation.module.css';
import { CustomTagTreeItem } from './CustomTagTreeItem';
import {
  TAG_PREFIX,
  getTagTreeItemLabel,
  parseNoteId,
  type TagTreeItem,
} from './tagTreeItems';
import { useTagTreeItems } from './useTagTreeItems';

export type { TagTreeItem } from './tagTreeItems';

export const TagTreeNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const { treeItems, isLoading, error } = useTagTreeItems();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (_event: React.MouseEvent, itemId: string) => {
    if (itemId.startsWith(TAG_PREFIX)) {
      setExpandedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
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

  return (
    <Box className={styles.root}>
      <Typography
        component="div"
        variant="caption"
        className={styles.header}
        color="text.secondary"
      >
        Tags
      </Typography>
      <Box
        className={styles.treeWrapper}
      >
        <RichTreeView<TagTreeItem>
          items={treeItems}
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
            // expandIcon: FolderIcon,
            // collapseIcon: FolderIcon,
          }}
        />
      </Box>
    </Box>
  );
};
