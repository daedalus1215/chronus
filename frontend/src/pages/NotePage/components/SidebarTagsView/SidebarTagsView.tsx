import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNoteTags } from '../../hooks/useNoteTags';
import { AddTagForm } from '../AddTagForm/AddTagForm';
import { Tag } from '../AddTagForm/AddTagForm';
import styles from './SidebarTagsView.module.css';

type SidebarTagsViewProps = {
  noteId: number;
};

export const SidebarTagsView: React.FC<SidebarTagsViewProps> = ({ noteId }) => {
  const { tags, error, removeTagFromNote, refetch } = useNoteTags(noteId);
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Convert noteTags (with id: number, name: string) to AddTagForm Tag type (id: string, name: string)
  const allTags: Tag[] = tags.map(tag => ({
    id: String(tag.id),
    name: tag.name,
  }));

  return (
    <Box className={styles.sidebarTags}>
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error.message}
        </Alert>
      )}

      <Box
        className={styles.chipContainer}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          py: 1.5,
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {tags.map(tag => (
          <Chip
            key={tag.id}
            label={tag.name}
            onDelete={() => handleRemoveTag(tag.id)}
            deleteIcon={<DeleteIcon fontSize="small" />}
            sx={{
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>

      {showAddForm ? (
        <AddTagForm
          noteId={noteId}
          tags={allTags}
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
    </Box>
  );
};
