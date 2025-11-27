import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tag } from '../../../../../api/dtos/tag.dtos';
import { TagActionGrid } from './TagActionGrid/TagActionGrid';
import styles from './TagItem.module.css';
import { TagForm, FormInitialData } from './TagActionGrid/TagForm/TagForm';
import { updateTag, fetchTagById } from '../../../../../api/requests/tags.requests';

interface TagItemProps {
  tag: Tag;
  onClick?: () => void;
  isSelected?: boolean;
}

export const TagItem: React.FC<TagItemProps> = ({ tag, onClick, isSelected }) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch full tag data when form opens
  const { data: fullTag, isLoading: isLoadingTag } = useQuery<Tag>({
    queryKey: ['tag', tag.id],
    queryFn: () => fetchTagById(tag.id),
    enabled: isFormOpen, // Only fetch when form is open
  });

  const updateTagMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      updateTag(tag.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', tag.id] });
      setIsFormOpen(false);
      setIsActionsOpen(false);
    },
  });

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(true);
  };

  const handleEdit = () => {
    setIsActionsOpen(false);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: FormInitialData) => {
    updateTagMutation.mutate({
      name: data.name,
      description: data.description,
    });
  };

  // Memoize initialData to prevent unnecessary re-renders
  const formInitialData = useMemo<FormInitialData>(() => ({
    name: fullTag?.name || tag.name,
    description: fullTag?.description || tag.description || '',
  }), [fullTag?.name, fullTag?.description, tag.name, tag.description]);

  return (
    <div 
      className={`${styles.tagListItem} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className={styles.tagInfo}>
        <span className={styles.tagName}>{tag.name}</span>
        <span className={styles.tagCount}>
          {tag.noteCount || 0} notes
        </span>
      </div>
      <button 
        className={styles.moreButton}
        onClick={handleMoreClick}
        aria-label="More options"
      >
        ⋮
      </button>
      <TagActionGrid 
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onEdit={handleEdit}
        onDelete={() => {}}
      />

      <TagForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={formInitialData}
        isSubmitting={updateTagMutation.isPending || isLoadingTag}
      />
    </div>
  );
};