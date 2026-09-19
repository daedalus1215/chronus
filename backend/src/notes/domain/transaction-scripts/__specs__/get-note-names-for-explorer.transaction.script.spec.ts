import { Test } from '@nestjs/testing';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { GetNoteNamesForExplorerTransactionScript } from '../get-note-names-for-explorer.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('GetNoteNamesForExplorerTransactionScript', () => {
  let target: GetNoteNamesForExplorerTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      getNoteNamesForExplorer: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetNoteNamesForExplorerTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<GetNoteNamesForExplorerTransactionScript>(
      GetNoteNamesForExplorerTransactionScript
    );
  });

  describe('apply', () => {
    it('should forward userId and folderId to the repository', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const rows = [
        { name: 'Note A', id: 1, isMemo: 1, folderId: 3 },
      ];
      mockRepository.getNoteNamesForExplorer.mockResolvedValue(rows);

      // Act
      const result = await target.apply(userId, '3');

      // Assert
      expect(mockRepository.getNoteNamesForExplorer).toHaveBeenCalledWith(
        userId,
        '3'
      );
      expect(result).toBe(rows);
    });
  });
});
