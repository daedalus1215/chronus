import React, { useState, useMemo } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      (allTags || [])
        .filter(tag => !noteTagIds.has(tag.id))
        .map(tag => ({
          id: String(tag.id),
          name: tag.name,
        })),
    [allTags, noteTagIds]
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
    <div className={styles.sidebarTags}>
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4 w-auto">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className={styles.formContainer}>
        {showAddForm ? (
          <AddTagForm
            noteId={noteId}
            tags={availableTags}
            onTagAdded={handleAddTag}
            onClose={() => setShowAddForm(false)}
          />
        ) : (
          <div className="flex items-center justify-between border-b border-[var(--color-overlay-stronger)] px-3 py-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Add tag"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <ul className={`${styles.tagList} min-h-0 flex-1 list-none overflow-y-auto p-0`}>
        {tags.map(tag => (
          <li
            key={tag.id}
            className="flex items-center justify-between border-b border-[var(--color-overlay-stronger)] px-4 py-1"
          >
            <span className="flex-1 text-sm">{tag.name}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove tag: ${tag.name}`}
              onClick={() => handleRemoveTag(tag.id)}
              className="text-muted-foreground"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
