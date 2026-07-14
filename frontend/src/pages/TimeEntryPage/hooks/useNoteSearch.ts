import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  searchNotes,
  createMemoByName,
} from '../../../api/requests/notes.requests';

export type NoteOption = {
  id: number;
  name: string;
};

export type CreateOption = { id: '__create__'; name: string };

export type NoteAutocompleteOption = NoteOption | CreateOption;

export function useNoteSearch() {
  const [options, setOptions] = useState<NoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteOption | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setOptions([]);
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const results = await searchNotes(searchQuery);
      // Check if this controller was aborted
      if (
        abortControllerRef.current &&
        abortControllerRef.current.signal.aborted
      )
        return;

      const unique = new Map<number, string>();
      for (const r of results) {
        if (!unique.has(r.noteId)) {
          unique.set(r.noteId, r.noteName);
        }
      }
      const opts: NoteOption[] = [...unique.entries()]
        .slice(0, 10)
        .map(([id, name]) => ({ id, name }));
      setOptions(opts);
    } catch {
      // ignore aborted requests
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setOptions([]);
    }
  }, [debouncedQuery, performSearch]);

  const handleSelect = useCallback(
    (value: NoteAutocompleteOption | null) => {
      if (value === null) {
        setSelectedNote(null);
        return;
      }
      if ((value as CreateOption).id === '__create__') {
        // Auto-create memo from the query text
        abortControllerRef.current?.abort();
        const name = query;
        createMemoByName(name).then(newNote => {
          setSelectedNote({ id: newNote.id, name: newNote.name });
        });
      } else {
        setSelectedNote(value as NoteOption);
      }
    },
    [query]
  );

  const reset = useCallback(() => {
    setQuery('');
    setOptions([]);
    setSelectedNote(null);
  }, []);

  const hasNoResults = query.length >= 2 && options.length === 0 && !loading;

  return {
    query,
    setQuery,
    options,
    loading,
    selectedNote,
    handleSelect,
    reset,
    hasNoResults,
  };
}
