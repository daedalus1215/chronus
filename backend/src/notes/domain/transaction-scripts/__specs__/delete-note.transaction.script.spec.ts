import { Test } from '@nestjs/testing';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { DeleteNoteTransactionScript } from '../delete-note.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('DeleteNoteTransactionScript', () => {
  let target: DeleteNoteTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      deleteNoteById: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteNoteTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<DeleteNoteTransactionScript>(
      DeleteNoteTransactionScript
    );
  });

  describe('apply', () => {
    it('should delete the note scoped to the user', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();

      // Act
      await target.apply(noteId, userId);

      // Assert
      expect(mockRepository.deleteNoteById).toHaveBeenCalledWith(
        noteId,
        userId
      );
    });
  });
});
