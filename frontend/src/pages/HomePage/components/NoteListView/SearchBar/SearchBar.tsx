import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  type?: 'MEMO' | 'CHECKLIST';
  /**
   * When true, a bare Tab press while the page background has focus
   * (no element focused) moves focus to the input and selects any
   * existing text. Tab with modifiers, Shift+Tab, and Tab from any
   * focused element are left to the browser.
   */
  tabFocusEnabled?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  type,
  tabFocusEnabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tabFocusEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (document.activeElement !== document.body) return;
      event.preventDefault();
      const input = inputRef.current;
      input?.focus();
      input?.select();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabFocusEnabled]);

  let placeholder = 'Search notes...';
  if (type === 'MEMO') placeholder = 'Search memos...';
  if (type === 'CHECKLIST') placeholder = 'Search checklists...';

  return (
    <div className={styles.searchBar}>
      <div className="relative mb-2.5 h-10">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-10 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="clear search"
            onClick={onClear}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
