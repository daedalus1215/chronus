import React, { useState } from 'react';
import { Tag } from '@/api/dtos/tag.dtos';
import { TagActionPanel } from './TagActionPanel/TagActionPanel';
import styles from './TagItem.module.css';

type TagItemProps = {
  tag: Tag;
  onClick?: () => void;
  isSelected?: boolean;
};

export const TagItem: React.FC<TagItemProps> = ({
  tag,
  onClick,
  isSelected,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(true);
  };

  return (
    <>
      <div
        className={`${styles.tagItem} ${isSelected ? styles.selected : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <div className={styles.tagInfo}>
          <span className={styles.tagName}>{tag.name}</span>
          <span className={styles.noteCount}>{tag.noteCount} notes</span>
        </div>
        <button
          className={styles.moreButton}
          onClick={handleMoreClick}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>
      {/* Sibling of the row (like NoteItem and tree rows): clicks inside the
          portaled confirm Dialog would otherwise bubble through the React
          tree to the row's onClick and navigate to the tag's notes page. */}
      <TagActionPanel
        tag={tag}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
      />
    </>
  );
};
