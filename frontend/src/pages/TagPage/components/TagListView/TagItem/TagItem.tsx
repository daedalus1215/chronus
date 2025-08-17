import React, { useState } from 'react';
import { Tag } from '../../../../../api/dtos/tag.dtos';
import styles from './TagItem.module.css';

interface TagItemProps {
  tag: Tag;
  onClick?: () => void;
  isSelected?: boolean;
}

export const TagItem: React.FC<TagItemProps> = ({ tag, onClick, isSelected }) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(true);
  };

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
    </div>
  );
};