import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  /** Placeholder when no value. Default: "Search tags...". */
  placeholder?: string;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search tags...',
}) => {
  return (
    <div className={styles.searchBar}>
      <div className="relative mb-2.5 h-10">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
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
