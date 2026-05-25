import { Injectable } from '@nestjs/common';
import { SearchResults } from 'src/notes/domain/services/note.service';

export type SearchResult = {
  noteId: number;
  noteName: string;
  isMemo: boolean;
  matchType: 'note_name' | 'memo_content' | 'check_item';
  contextBefore: string;
  matchText: string;
  contextAfter: string;
};

function extractContext(
  text: string,
  query: string,
  contextLen = 60
): { contextBefore: string; matchText: string; contextAfter: string } {
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(query.toLowerCase());
  if (idx === -1) {
    return {
      contextBefore: '',
      matchText: text.slice(0, query.length),
      contextAfter: '',
    };
  }
  const beforeStart = Math.max(0, idx - contextLen);
  const afterEnd = Math.min(text.length, idx + query.length + contextLen);
  return {
    contextBefore:
      (beforeStart > 0 ? '...' : '') + text.slice(beforeStart, idx),
    matchText: text.slice(idx, idx + query.length),
    contextAfter:
      text.slice(idx + query.length, afterEnd) +
      (afterEnd < text.length ? '...' : ''),
  };
}

@Injectable()
export class SearchNotesResponder {
  apply({
    query,
    noteNameMatches,
    memoMatches,
    checkItemMatches,
  }: SearchResults): SearchResult[] {
    const results: SearchResult[] = [];

    for (const row of noteNameMatches) {
      results.push({
        noteId: row.noteId,
        noteName: row.noteName,
        isMemo: row.isMemo,
        matchType: 'note_name',
        ...extractContext(row.noteName, query),
      });
    }

    for (const row of memoMatches) {
      results.push({
        noteId: row.noteId,
        noteName: row.noteName,
        isMemo: true,
        matchType: 'memo_content',
        ...extractContext(row.description, query),
      });
    }

    for (const row of checkItemMatches) {
      results.push({
        noteId: row.noteId,
        noteName: row.noteName,
        isMemo: false,
        matchType: 'check_item',
        ...extractContext(row.checkItemName, query),
      });
    }

    return results;
  }
}
