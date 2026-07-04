import { useCallback, useMemo, useState } from 'react';
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

  // Matching — skip entirely while the filter is inactive.
  const folderMatches = useMemo(() => {
    if (!active || !debouncedQuery) return new Set<number>();
    const result = new Set<number>();
    for (const root of tree) {
      const matches = collectAncestorMatches(root, debouncedQuery, notes);
      matches.forEach(id => result.add(id));
    }
    return result;
  }, [active, tree, notes, debouncedQuery]);

  const noteMatches = useMemo(() => {
    if (!active || !debouncedQuery) return new Set<number>();
    return new Set(notes.filter(n => nameMatches(n.name, debouncedQuery)).map(n => n.id));
  }, [active, notes, debouncedQuery]);

  const clear = useCallback(() => {
    setQuery('');
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    setActive(prev => !prev);
  }, []);

  // Note: the Ctrl+. and Escape shortcuts are handled by ExplorerTree, which
  // scopes them to the tree panel and coordinates Escape with selection state.

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
