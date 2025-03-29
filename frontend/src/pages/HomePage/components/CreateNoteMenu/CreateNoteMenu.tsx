import React, { useEffect, useRef } from 'react';
import styles from './CreateNoteMenu.module.css';

type CreateNoteMenuProps = {
  onSelect: (type: 'memo' | 'checklist') => void;
  onClose: () => void;
};

export const CreateNoteMenu: React.FC<CreateNoteMenuProps> = ({ onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button 
        className={styles.menuButton}
        onClick={() => onSelect('memo')}
      >
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M15 15H7v-2h8v2zm2-4H7V9h10v2z"/>
          </svg>
        </span>
        New Text Note
      </button>
      <div className={styles.menuDivider} />
      <button 
        className={styles.menuButton}
        onClick={() => onSelect('checklist')}
      >
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M18 9l-1.4-1.4-5.6 5.6-2.6-2.6L7 12l4 4z"/>
          </svg>
        </span>
        New Checklist
      </button>
    </div>
  );
}; 