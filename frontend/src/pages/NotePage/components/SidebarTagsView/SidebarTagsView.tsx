import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNoteTags } from '../../hooks/useNoteTags';
import { useAllTags } from '../../hooks/useAllTags';
import { AddTagForm } from '../AddTagForm/AddTagForm';
import { Tag } from '../AddTagForm/AddTagForm';
import styles from './SidebarTagsView.module.css';

type SidebarTagsViewProps = {
  noteId: number;
};

export const SidebarTagsView: React.FC<SidebarTagsViewProps> = ({ noteId }) => {
  const { tags, error, removeTagFromNote, refetch } = useNoteTags(noteId);
  const { data: allTags } = useAllTags();
  const [showAddForm, setShowAddForm] = useState(false);

  const noteTagIds = useMemo(() => new Set(tags.map(t => t.id)), [tags]);

  // Tags the note does NOT have — these go into the add-tag popup
  const availableTags: Tag[] = useMemo(
    () =>
      (allTags || []).filter(tag => !noteTagIds.has(tag.id)).map(tag => ({
        id: String(tag.id),
        name: tag.name,
      })),
    [allTags, noteTagIds],
  );

  const handleRemoveTag = async (tagId: number): Promise<void> => {
    try {
      await removeTagFromNote({ tagId, noteId });
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const handleAddTag = async (): Promise<void> => {
    try {
      await refetch();
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  return (
    <Box className={styles.sidebarTags}>
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error.message}
        </Alert>
      )}

      <List
        className={styles.tagList}
        sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {tags.map(tag => (
          <ListItem
            key={tag.id}
            disableGutters
            sx={{
              borderBottom: '1px solid var(--color-overlay-stronger)',
              py: 0.5,
              px: 2,
            }}
          >
            <ListItemText
              primary={tag.name}
              sx={{
                flex: 1,
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                },
              }}
            />
            <IconButton
              edge="end"
              size="small"
              aria-label={`Remove tag: ${tag.name}`}
              onClick={() => handleRemoveTag(tag.id)}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <div className={styles.formContainer}>
        {showAddForm ? (
          <AddTagForm
            noteId={noteId}
            tags={availableTags}
            onTagAdded={handleAddTag}
            onClose={() => setShowAddForm(false)}
          />
        ) : (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderTop: '1px solid var(--color-overlay-stronger)',
            }}
          >
            <Chip
              label="+ Add Tag"
              onClick={() => setShowAddForm(true)}
              sx={{
                cursor: 'pointer',
              }}
            />
          </Box>
        )}
      </div>
    </Box>
  );
};
