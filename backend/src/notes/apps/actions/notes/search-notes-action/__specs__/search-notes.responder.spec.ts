import { SearchNotesResponder } from '../search-notes.responder';
import { SearchResults } from 'src/notes/domain/services/note.service';

const createMockSearchResults = (overrides: Partial<SearchResults> = {}): SearchResults => ({
  query: 'test',
  noteNameMatches: [],
  memoMatches: [],
  checkItemMatches: [],
  ...overrides,
});

describe('SearchNotesResponder', () => {
  let target: SearchNotesResponder;

  beforeEach(() => {
    target = new SearchNotesResponder();
  });

  describe('apply', () => {
    it('should return empty array when no matches', () => {
      const results = createMockSearchResults();
      const output = target.apply(results);
      expect(output).toEqual([]);
    });

    it('should map note name matches correctly', () => {
      const results = createMockSearchResults({
        query: 'deploy',
        noteNameMatches: [
          { noteId: 1, noteName: 'Deploy to prod', isMemo: false },
        ],
      });
      const output = target.apply(results);
      expect(output).toHaveLength(1);
      expect(output[0]).toMatchObject({
        noteId: 1,
        noteName: 'Deploy to prod',
        isMemo: false,
        matchType: 'note_name',
        matchText: 'Deploy',
      });
    });

    it('should map memo matches correctly', () => {
      const results = createMockSearchResults({
        query: 'bug',
        memoMatches: [
          { noteId: 2, noteName: 'Bug notes', description: 'Found a bug in auth' },
        ],
      });
      const output = target.apply(results);
      expect(output).toHaveLength(1);
      expect(output[0]).toMatchObject({
        noteId: 2,
        noteName: 'Bug notes',
        isMemo: true,
        matchType: 'memo_content',
        matchText: 'bug',
      });
    });

    it('should include check item metadata in results', () => {
      const results = createMockSearchResults({
        query: 'fix',
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Sprint tasks',
            checkItemId: 10,
            checkItemName: 'Fix login bug',
            checkItemStatus: 'in_progress',
            checkItemDescription: 'Fix the login bug reported by users',
            checkItemIsArchived: false,
          },
        ],
      });
      const output = target.apply(results);
      expect(output).toHaveLength(1);
      expect(output[0]).toMatchObject({
        noteId: 3,
        noteName: 'Sprint tasks',
        isMemo: false,
        matchType: 'check_item',
        checkItemId: 10,
        checkItemStatus: 'in_progress',
        checkItemIsArchived: false,
        matchText: 'Fix',
      });
      expect(output[0].checkItemDescriptionSnippet).toContain('Fix the login bug');
    });

    it('should truncate long descriptions to 100 chars with ellipsis', () => {
      const longDesc = 'A'.repeat(200);
      const results = createMockSearchResults({
        query: 'fix',
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Sprint tasks',
            checkItemId: 10,
            checkItemName: 'Fix something',
            checkItemStatus: 'ready',
            checkItemDescription: longDesc,
            checkItemIsArchived: false,
          },
        ],
      });
      const output = target.apply(results);
      expect(output[0].checkItemDescriptionSnippet).toHaveLength(103); // 100 + '...'
      expect(output[0].checkItemDescriptionSnippet!.endsWith('...')).toBe(true);
    });

    it('should handle null description gracefully', () => {
      const results = createMockSearchResults({
        query: 'fix',
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Sprint tasks',
            checkItemId: 10,
            checkItemName: 'Fix something',
            checkItemStatus: 'done',
            checkItemDescription: null,
            checkItemIsArchived: false,
          },
        ],
      });
      const output = target.apply(results);
      expect(output[0].checkItemDescriptionSnippet).toBeNull();
    });

    it('should mark archived check items correctly', () => {
      const results = createMockSearchResults({
        query: 'test',
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Old tasks',
            checkItemId: 20,
            checkItemName: 'Test deprecated feature',
            checkItemStatus: 'done',
            checkItemDescription: null,
            checkItemIsArchived: true,
          },
        ],
      });
      const output = target.apply(results);
      expect(output[0].checkItemIsArchived).toBe(true);
    });

    it('should include all match types in a single result set', () => {
      const results = createMockSearchResults({
        query: 'search',
        noteNameMatches: [
          { noteId: 1, noteName: 'Search results', isMemo: false },
        ],
        memoMatches: [
          { noteId: 2, noteName: 'Search notes', description: 'Search functionality notes' },
        ],
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Tasks',
            checkItemId: 10,
            checkItemName: 'Search bar fix',
            checkItemStatus: 'ready',
            checkItemDescription: null,
            checkItemIsArchived: false,
          },
        ],
      });
      const output = target.apply(results);
      expect(output).toHaveLength(3);
      expect(output[0].matchType).toBe('note_name');
      expect(output[1].matchType).toBe('memo_content');
      expect(output[2].matchType).toBe('check_item');
    });
  });
});
