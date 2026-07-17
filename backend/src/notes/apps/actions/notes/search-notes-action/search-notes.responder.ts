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
  // Optional fields present when matchType === 'check_item'
  checkItemStatus?: 'ready' | 'in_progress' | 'review' | 'done';
  checkItemArchived?: boolean;
  checkItemDescription?: string;
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
      // Determine context: if description contains the query, show description context; otherwise name context
      const descMatch =
        row.checkItemDescription &&
        row.checkItemDescription
          .toLowerCase()
          .includes(query.toLowerCase());

      results.push({
        noteId: row.noteId,
        noteName: row.noteName,
        isMemo: false,
        matchType: 'check_item',
        ...(descMatch
          ? extractContext(row.checkItemDescription, query)
          : extractContext(row.checkItemName, query)),
        checkItemStatus: row.checkItemStatus,
        checkItemArchived: row.checkItemArchived,
        checkItemDescription: row.checkItemDescription,
      });
    }

    return results;
  }
}
