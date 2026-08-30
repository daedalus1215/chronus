import React from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './AddNoteSuggestion.module.css';

type AddNoteSuggestionProps = {
  query: string;
  onAdd: () => void;
  isAdding?: boolean;
  error?: string | null;
  /** Smaller padding and font to match the desktop list's compact items. */
  compact?: boolean;
};

export const AddNoteSuggestion: React.FC<AddNoteSuggestionProps> = ({
  query,
  onAdd,
  isAdding = false,
  error,
  compact = false,
}) => (
  <div>
    <div
      className={`${styles.suggestionRow} ${compact ? styles.compact : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Add checklist "${query}"`}
      onClick={onAdd}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd();
        }
      }}
    >
      {isAdding ? (
        <CircularProgress size={16} className={styles.suggestionSpinner} />
      ) : (
        <AddIcon fontSize="small" className={styles.suggestionIcon} />
      )}
      <span className={styles.suggestionText} title={`Add "${query}" checklist`}>
        Add "{query}" checklist
      </span>
    </div>
    {error && <div className={styles.suggestionError}>{error}</div>}
  </div>
);
