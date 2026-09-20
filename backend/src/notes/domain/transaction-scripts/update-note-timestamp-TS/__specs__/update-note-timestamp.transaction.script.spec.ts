import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { UpdateNoteTimestampTransactionScript } from '../update-note-timestamp.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('UpdateNoteTimestampTransactionScript', () => {
  let target: UpdateNoteTimestampTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      updateNoteTimestamp: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateNoteTimestampTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<UpdateNoteTimestampTransactionScript>(
      UpdateNoteTimestampTransactionScript
    );
  });

  describe('apply', () => {
    it('should resolve when the note was updated', async () => {
      // Arrange
      const id = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.updateNoteTimestamp.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      // Act
      const result = await target.apply(id, userId);

      // Assert
      expect(mockRepository.updateNoteTimestamp).toHaveBeenCalledWith(
        id,
        userId
      );
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when the note is missing or not owned', async () => {
      // Arrange
      const id = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.updateNoteTimestamp.mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      // Act / Assert
      await expect(target.apply(id, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
