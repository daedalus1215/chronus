import React, { useRef } from 'react';
import styles from './SearchBar.module.css';
import { Input } from '@mui/material';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  type?: 'MEMO' | 'CHECKLIST';
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear, type }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  let placeholder = 'Search notes...';
  if (type === 'MEMO') placeholder = 'Search memos...';
  if (type === 'CHECKLIST') placeholder = 'Search checklists...';

  return (
    <div className={styles.searchContainer}>
      
        <Input
          ref={inputRef}
          type="text"
          name="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
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