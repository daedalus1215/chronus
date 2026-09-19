import { Test } from '@nestjs/testing';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { GetNoteVersionsTransactionScript } from '../get-note-versions.transaction.script';
import { NoteVersionRepository } from 'src/notes/infra/repositories/note-version.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('GetNoteVersionsTransactionScript', () => {
  let target: GetNoteVersionsTransactionScript;
  let mockVersionRepository: jest.Mocked<NoteVersionRepository>;

  beforeEach(async () => {
    // Arrange
    mockVersionRepository = createMock<NoteVersionRepository>({
      findByNoteId: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetNoteVersionsTransactionScript,
        { provide: NoteVersionRepository, useValue: mockVersionRepository },
      ],
    }).compile();

    target = moduleRef.get<GetNoteVersionsTransactionScript>(
      GetNoteVersionsTransactionScript
    );
  });

  describe('apply', () => {
    it('should forward noteId and userId to the repository', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const versions = [
        {
          id: 1,
          noteId,
          versionNum: 1,
          description: 'old',
          createdAt: new Date(),
        },
      ];
      mockVersionRepository.findByNoteId.mockResolvedValue(versions);
      // Act
      const result = await target.apply(noteId, userId);

      // Assert
      expect(mockVersionRepository.findByNoteId).toHaveBeenCalledWith(
        noteId,
        userId
      );
      expect(result).toBe(versions);
    });
  });
});
