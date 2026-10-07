import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './ExplorerTree.module.css';

type ExplorerFilterBarProps = {
  query: string;
  setQuery: (q: string) => void;
  onClear?: () => void;
};

export const ExplorerFilterBar: React.FC<ExplorerFilterBarProps> = ({
  query,
  setQuery,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the filter bar appears
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles.filterBar}>
      <Search size={14} style={{ color: 'var(--color-text-muted)', marginRight: 4, flexShrink: 0 }} />
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter folders and notes..."
        className={styles.filterInput}
      />
      {query ? (
        <button
          type="button"
          className={styles.filterClear}
          onClick={() => {
            onClear?.();
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
};
