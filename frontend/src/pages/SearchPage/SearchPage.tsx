import React, { useState, useCallback, useRef } from 'react';
import { Search, X, StickyNote, SquareCheck, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { searchNotes } from '../../api/requests/notes.requests';
import { SearchResult } from '../../api/dtos/note.dtos';
import styles from './SearchPage.module.css';

const MATCH_TYPE_LABELS: Record<SearchResult['matchType'], string> = {
  note_name: 'Title',
  memo_content: 'Content',
  check_item: 'Checklist item',
};

const STATUS_LABELS: Record<string, string> = {
  ready: 'Ready',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

/** Tailwind classes layered onto the outline Badge per status; shadcn has
 * no built-in color variants beyond default/destructive. */
const STATUS_BADGE_CLASSES: Record<string, string> = {
  ready: '',
  in_progress: 'border-primary/50 text-primary',
  review: 'border-[var(--color-warning)] text-[var(--color-warning-dark)]',
  done: 'border-green-600/50 text-green-700 dark:text-green-400',
};

const DEBOUNCE_MS = 400;

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchNotes(q.trim(), { includeArchived });
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), DEBOUNCE_MS);
  };

  const handleArchiveToggle = (checked: boolean) => {
    setIncludeArchived(checked);
    if (query.trim().length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(query), 0);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleClick = (noteId: number) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <div className={styles.page}>
      <div className={cn(styles.searchBar, 'flex items-center gap-4')}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search memos and checklists..."
            value={query}
            onChange={handleChange}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-9 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {query ? (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="m-1.5 size-[18px] animate-spin text-muted-foreground" />
              ) : (
                <Button variant="ghost" size="icon-sm" onClick={handleClear}>
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ) : null}
        </div>
        <Label className="flex shrink-0 items-center gap-2 font-normal">
          <Switch checked={includeArchived} onCheckedChange={handleArchiveToggle} />
          Include archived
        </Label>
      </div>

      {!searched && !loading && (
        <div className={styles.emptyState}>
          <Search className="mb-1 size-12 text-muted-foreground/60" />
          <span className="text-muted-foreground">
            Type at least 2 characters to search
          </span>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <span className="text-muted-foreground">
            No results for "{query}"
          </span>
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.resultList}>
          {results.map((result, idx) => (
            <div
              key={`${result.noteId}-${result.matchType}-${idx}`}
              className={styles.resultItem}
            >
              <button
                type="button"
                onClick={() => handleClick(result.noteId)}
                className={styles.resultButton}
              >
                <div className={styles.resultContent}>
                  <div className={styles.resultHeader}>
                    {result.isMemo ? (
                      <StickyNote className="size-4 text-primary" />
                    ) : (
                      <SquareCheck className="size-4" style={{ color: 'var(--accent-2)' }} />
                    )}
                    <span
                      className={cn(
                        styles.noteName,
                        result.checkItemIsArchived &&
                          'text-muted-foreground line-through'
                      )}
                    >
                      {result.noteName}
                    </span>
                    <Badge variant="outline" className={styles.matchChip}>
                      {MATCH_TYPE_LABELS[result.matchType]}
                    </Badge>
                    {result.matchType === 'check_item' &&
                      result.checkItemStatus && (
                        <Badge
                          variant="outline"
                          className={cn(
                            styles.matchChip,
                            STATUS_BADGE_CLASSES[result.checkItemStatus]
                          )}
                        >
                          {STATUS_LABELS[result.checkItemStatus]}
                        </Badge>
                      )}
                    {result.matchType === 'check_item' &&
                      result.checkItemIsArchived && (
                        <Badge
                          variant="outline"
                          className={cn(styles.matchChip, 'text-muted-foreground')}
                        >
                          Archived
                        </Badge>
                      )}
                  </div>
                  <p className={styles.context}>
                    <span className={styles.contextText}>
                      {result.contextBefore}
                    </span>
                    <mark className={styles.highlight}>{result.matchText}</mark>
                    <span className={styles.contextText}>
                      {result.contextAfter}
                    </span>
                  </p>
                  {result.matchType === 'check_item' &&
                    result.checkItemDescriptionSnippet && (
                      <p className={cn(styles.descriptionSnippet, 'text-muted-foreground')}>
                        {result.checkItemDescriptionSnippet}
                      </p>
                    )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
