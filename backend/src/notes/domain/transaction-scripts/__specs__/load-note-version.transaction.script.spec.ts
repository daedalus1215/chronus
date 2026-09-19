import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { LoadNoteVersionTransactionScript } from '../load-note-version.transaction.script';
import { NoteVersionRepository } from 'src/notes/infra/repositories/note-version.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('LoadNoteVersionTransactionScript', () => {
  let target: LoadNoteVersionTransactionScript;
  let mockVersionRepository: jest.Mocked<NoteVersionRepository>;

  beforeEach(async () => {
    // Arrange
    mockVersionRepository = createMock<NoteVersionRepository>({
      findById: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        LoadNoteVersionTransactionScript,
        { provide: NoteVersionRepository, useValue: mockVersionRepository },
      ],
    }).compile();

    target = moduleRef.get<LoadNoteVersionTransactionScript>(
      LoadNoteVersionTransactionScript
    );
  });

  describe('apply', () => {
    it('should return the version when it belongs to the note and user', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const versionId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const version = {
        id: versionId,
        noteId,
        versionNum: 3,
        description: 'restored body',
        createdAt: new Date(),
      };
      mockVersionRepository.findById.mockResolvedValue(version);

      // Act
      const result = await target.apply(noteId, versionId, userId);

      // Assert
      expect(mockVersionRepository.findById).toHaveBeenCalledWith(
        versionId,
        noteId,
        userId
      );
      expect(result).toBe(version);
    });

    it('should throw NotFoundException when the version is missing or not owned', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const versionId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockVersionRepository.findById.mockResolvedValue(null);

      // Act / Assert
      await expect(
        target.apply(noteId, versionId, userId)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
