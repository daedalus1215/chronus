import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import { NoteDtoToEntityConverter } from '../note-dto-to-entity.converter';
import { createMockNote, createMockUpdateNoteDto } from 'src/notes/test-utils';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('NoteDtoToEntityConverter', () => {
  let converter: NoteDtoToEntityConverter;

  beforeEach(() => {
    // Arrange
    converter = new NoteDtoToEntityConverter();
  });

  describe('apply', () => {
    describe('when updating a note without an existing memo', () => {
      it('should create a new memo with the provided description', () => {
        // Arrange
        const note = createMockNote({ memo: null });
        const updateDto = createMockUpdateNoteDto({
          name: 'New Note',
          description: 'New Description'
        });

        // Act
        const result = converter.apply(updateDto, note);

        // Assert
        expect(result.name).toBe('New Note');
        expect(result.memo).toBeDefined();
        expect(result.memo.description).toBe('New Description');
      });
    });

    describe('when updating a note with an existing memo', () => {
      it('should update the memo while preserving its properties', () => {
        // Arrange
        const existingMemo: Memo = {
          id: generateRandomNumbers(),
          description: 'Old Description',
          note: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const note = createMockNote({ memo: existingMemo });
        const updateDto = createMockUpdateNoteDto({
          name: 'Updated Note',
          description: 'Updated Description'
        });

        // Act
        const result = converter.apply(updateDto, note);

        // Assert
        expect(result.name).toBe('Updated Note');
        expect(result.memo).toBeDefined();
        expect(result.memo.id).toBe(existingMemo.id);
        expect(result.memo.description).toBe('Updated Description');
        expect(result.memo.createdAt).toBe(existingMemo.createdAt);
        expect(result.memo.updatedAt).toBe(existingMemo.updatedAt);
      });
    });

    describe('when performing a partial update', () => {
      it('should only update the provided fields', () => {
        // Arrange
        const note = createMockNote();
        const updateDto = createMockUpdateNoteDto({
          name: 'Only Name Update',
          description: undefined
        });

        // Act
        const result = converter.apply(updateDto, note);

        // Assert
        expect(result.name).toBe('Only Name Update');
        expect(result.memo).toBeDefined();
        expect(result.memo.description).toBe(undefined);
      });
    });

    describe('when updating a note', () => {
      it('should preserve all unmodified properties', () => {
        // Arrange
        const originalNote = createMockNote({
            userId: generateRandomNumbers(),
          archivedAt: new Date(),
        });
        const updateDto = createMockUpdateNoteDto();

        // Act
        const result = converter.apply(updateDto, originalNote);

        // Assert
        expect(result.id).toBe(originalNote.id);
        expect(result.userId).toBe(originalNote.userId);
        expect(result.archivedAt).toBe(originalNote.archivedAt);
        expect(result.createdAt).toBe(originalNote.createdAt);
        expect(result.updatedAt).toBe(originalNote.updatedAt);
      });
    });
  });
}); 