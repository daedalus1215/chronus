import React, { useEffect, useRef } from 'react';
import styles from './CreateNoteMenu.module.css';
import { NOTE_TYPES } from '../../../../constant';

type CreateNoteMenuProps = {
  onSelect: (type: keyof typeof NOTE_TYPES) => void;
  onImport: (file: File) => void;
  onClose: () => void;
};

export const CreateNoteMenu: React.FC<CreateNoteMenuProps> = ({
  onSelect,
  onImport,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    onClose();
  };

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".chronus"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className={styles.menuButton}
        onClick={() => onSelect(NOTE_TYPES.MEMO)}
      >
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            <path d="M15 15H7v-2h8v2zm2-4H7V9h10v2z" />
          </svg>
        </span>
        New Text Note
      </button>
      <div className={styles.menuDivider} />
      <button
        className={styles.menuButton}
        onClick={() => onSelect(NOTE_TYPES.CHECKLIST)}
      >
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            <path d="M18 9l-1.4-1.4-5.6 5.6-2.6-2.6L7 12l4 4z" />
          </svg>
        </span>
        New Checklist
      </button>
      <div className={styles.menuDivider} />
      <button className={styles.menuButton} onClick={handleImportClick}>
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" />
            <path d="M12 12l-4-4h2.5V6h3v2H16z" />
          </svg>
        </span>
        Import Memo
      </button>
    </div>
  );
};
