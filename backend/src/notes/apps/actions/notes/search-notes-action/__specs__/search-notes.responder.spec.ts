import { SearchNotesResponder } from '../search-notes.responder';

describe('SearchNotesResponder', () => {
  let responder: SearchNotesResponder;

  beforeEach(() => {
    responder = new SearchNotesResponder();
  });

  describe('apply', () => {
    it('should include checkItemStatus for check_item matches', () => {
      const results = responder.apply({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 1,
            noteName: 'My Note',
            checkItemId: 10,
            checkItemName: 'Test item',
            checkItemDescription: null,
            checkItemStatus: 'in_progress',
            checkItemArchived: false,
          },
        ],
      });

      expect(results[0].matchType).toBe('check_item');
      expect(results[0].checkItemStatus).toBe('in_progress');
      expect(results[0].checkItemArchived).toBe(false);
    });

    it('should include checkItemArchived flag when archived', () => {
      const results = responder.apply({
        query: 'old',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 2,
            noteName: 'Archive Note',
            checkItemId: 20,
            checkItemName: 'Old task',
            checkItemDescription: 'This is an old task',
            checkItemStatus: 'done',
            checkItemArchived: true,
          },
        ],
      });

      expect(results[0].checkItemArchived).toBe(true);
      expect(results[0].checkItemStatus).toBe('done');
    });

    it('should use description context when description matches query', () => {
      const results = responder.apply({
        query: 'description',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Some Note',
            checkItemId: 30,
            checkItemName: 'Short name',
            checkItemDescription:
              'This item has a description that mentions the query term',
            checkItemStatus: 'ready',
            checkItemArchived: false,
          },
        ],
      });

      // Context should come from description since it contains the query
      expect(results[0].matchText).toBe('description');
      expect(results[0].contextBefore).toContain('has a');
    });

    it('should use name context when only name matches', () => {
      const results = responder.apply({
        query: 'short',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 4,
            noteName: 'Another Note',
            checkItemId: 40,
            checkItemName: 'Short name',
            checkItemDescription: 'No match here',
            checkItemStatus: 'review',
            checkItemArchived: false,
          },
        ],
      });

      // Context should come from name since description doesn't match
      expect(results[0].matchText).toBe('Short');
    });

    it('should handle null description gracefully', () => {
      const results = responder.apply({
        query: 'name',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 5,
            noteName: 'Note Five',
            checkItemId: 50,
            checkItemName: 'Name match',
            checkItemDescription: null,
            checkItemStatus: 'ready',
            checkItemArchived: false,
          },
        ],
      });

      expect(results[0].matchText).toBe('Name');
      expect(results[0].checkItemDescription).toBe(null);
    });

    it('should combine all match types in a single result set', () => {
      const results = responder.apply({
        query: 'search',
        noteNameMatches: [
          { noteId: 1, noteName: 'Search results', isMemo: false },
        ],
        memoMatches: [
          {
            noteId: 2,
            noteName: 'Memo note',
            description: 'This memo has search content',
          },
        ],
        checkItemMatches: [
          {
            noteId: 3,
            noteName: 'Checklist',
            checkItemId: 10,
            checkItemName: 'Search item',
            checkItemDescription: null,
            checkItemStatus: 'ready',
            checkItemArchived: false,
          },
        ],
      });

      expect(results).toHaveLength(3);
      expect(results[0].matchType).toBe('note_name');
      expect(results[1].matchType).toBe('memo_content');
      expect(results[2].matchType).toBe('check_item');
    });

    it('should include checkItemDescription in result', () => {
      const results = responder.apply({
        query: 'task',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [
          {
            noteId: 6,
            noteName: 'Tasks',
            checkItemId: 60,
            checkItemName: 'Do task',
            checkItemDescription: 'Complete this important task today',
            checkItemStatus: 'in_progress',
            checkItemArchived: false,
          },
        ],
      });

      expect(results[0].checkItemDescription).toBe(
        'Complete this important task today'
      );
    });
  });
});
