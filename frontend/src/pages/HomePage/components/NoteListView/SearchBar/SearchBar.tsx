import React, { useRef } from 'react';
import styles from './SearchBar.module.css';
import { Input } from '@mui/material';
import { useIsMobile } from '../../../../../hooks/useIsMobile';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  type?: 'MEMO' | 'CHECKLIST';
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear, type }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  let placeholder = 'Search notes...';
  if (type === 'MEMO') placeholder = 'Search memos...';
  if (type === 'CHECKLIST') placeholder = 'Search checklists...';

  return (
    <div className={`${styles.searchContainer} ${isMobile ? styles.searchContainerMobile : ''}`}>
      
        <Input
          ref={inputRef}
          type="text"
          name="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.searchInput} ${isMobile ? styles.searchInputMobile : ''}`}
        />
        {value && (
          <button 
            onClick={onClear}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
  );
}; 