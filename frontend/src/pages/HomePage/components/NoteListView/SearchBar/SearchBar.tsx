import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus the input when opening
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      // Clear search when closing
      onClear();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !inputRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        onClear();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClear]);

  return (
    <div className={`${styles.searchContainer} ${isOpen ? styles.open : ''}`}>
      <button 
        onClick={handleToggle}
        className={styles.searchButton}
        aria-label={isOpen ? "Close search" : "Open search"}
      >
        <SearchIcon className={styles.searchIcon} />
      </button>
      
      <div className={`${styles.searchInputContainer} ${isOpen ? styles.open : ''}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes..."
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
    </div>
  );
}; 