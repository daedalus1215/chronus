import { useCallback, useEffect, useMemo, useState } from 'react';
import { FolderTreeNode } from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import { useDebounce } from '../../../../hooks/useDebounce';

/**
 * Word-boundary matching: the query must match as a whole "word" inside the name.
 * E.g. "proj" matches "project" but not "projectile"; "ai" matches "AI notes" but not "rainier".
 */
function nameMatches(name: string, query: string): boolean {
  if (!query) return true;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('(?:^|[^a-zA-Z0-9])' + escaped + '(?:[^a-zA-Z0-9]|$)', 'i');
  return regex.test(name);
}

/**
 * Recursively find all folder IDs that either match directly or contain a matching descendant.
 */
function collectAncestorMatches(
  node: FolderTreeNode,
  query: string,
  notes: ExplorerNoteItem[],
): Set<number> {
  const result = new Set<number>();
  const folderMatches = nameMatches(node.name, query);

  const childNotes = notes.filter(n => n.folderId === node.id);
  const noteHasMatch = childNotes.some(n => nameMatches(n.name, query));

  let descendantFolderHasMatch = false;
  for (const child of node.children) {
    const childMatches = collectAncestorMatches(child, query, notes);
    if (childMatches.size > 0) {
      descendantFolderHasMatch = true;
      result.add(child.id);
    }
  }

  if (folderMatches || noteHasMatch || descendantFolderHasMatch) {
    result.add(node.id);
  }

  return result;
}

export type ExplorerFilterState = {
  active: boolean;
  query: string;
  debouncedQuery: string;
  setQuery: (q: string) => void;
  clear: () => void;
  toggle: () => void;
  folderMatches: Set<number>;     // folder IDs that match or contain matches
  noteMatches: Set<number>;       // note IDs that match directly
};

export const useExplorerFilter = (
  tree: FolderTreeNode[],
  notes: ExplorerNoteItem[],
): ExplorerFilterState => {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  // Matching
  const folderMatches = useMemo(() => {
    if (!debouncedQuery) return new Set<number>();
    const result = new Set<number>();
    for (const root of tree) {
      const matches = collectAncestorMatches(root, debouncedQuery, notes);
      matches.forEach(id => result.add(id));
    }
    return result;
  }, [tree, notes, debouncedQuery]);

  const noteMatches = useMemo(() => {
    if (!debouncedQuery) return new Set<number>();
    return new Set(notes.filter(n => nameMatches(n.name, debouncedQuery)).map(n => n.id));
  }, [notes, debouncedQuery]);

  const clear = useCallback(() => {
    setQuery('');
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    setActive(prev => !prev);
  }, []);

  // Keyboard shortcut: Ctrl+.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && active) {
        clear();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, toggle, clear]);

  return {
    active,
    query,
    debouncedQuery,
    setQuery,
    clear,
    toggle,
    folderMatches,
    noteMatches,
  };
};

/**
 * Helper: given the user-expanded set and the filter's auto-expanded set,
 * compute the merged expanded set. If the filter is inactive, return the
 * user-expanded set unchanged.
 */
export function useMergedExpanded(
  userExpanded: Set<number>,
  folderMatches: Set<number>,
  active: boolean,
): Set<number> {
  return useMemo(() => {
    if (!active) return userExpanded;
    const merged = new Set(userExpanded);
    folderMatches.forEach(id => merged.add(id));
    return merged;
  }, [userExpanded, folderMatches, active]);
}
