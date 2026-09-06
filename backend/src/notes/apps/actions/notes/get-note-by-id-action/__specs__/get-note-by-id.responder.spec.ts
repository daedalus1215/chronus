import { GetNoteByIdResponder } from '../get-note-by-id.responder';
import { NoteWithCheckItems } from '../../../../../domain/services/note.service';
import { createMockNote } from 'src/notes/test-utils/mock-factories';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

const createMockMemo = (overrides: Partial<Memo> = {}): Memo => ({
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: 'Memo body',
  note: null as unknown as Memo['note'],
  ...overrides,
});

describe('given: GetNoteByIdResponder', () => {
  let target: GetNoteByIdResponder;

  beforeEach(() => {
    // Arrange
    target = new GetNoteByIdResponder();
  });

  describe('when: applying to a memo that is in a folder', () => {
    test('then: the response includes the note folderId', () => {
      // Arrange
      const folderId = generateRandomNumbers();
      const note = createMockNote({
        folderId,
        memo: createMockMemo(),
      });
      const input: NoteWithCheckItems = { note, checkItems: [] };

      // Act
      const result = target.apply(input);

      // Assert
      expect(result.id).toBe(note.id);
      expect(result.isMemo).toBe(true);
      expect(result.description).toBe('Memo body');
      expect(result.folderId).toBe(folderId);
    });
  });

  describe('when: applying to a note without a folder', () => {
    test('then: the response folderId is null', () => {
      // Arrange
      const note = createMockNote({ folderId: null });
      const input: NoteWithCheckItems = { note, checkItems: [] };

      // Act
      const result = target.apply(input);

      // Assert
      expect(result.folderId).toBeNull();
    });
  });
});
