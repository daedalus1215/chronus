import { Test } from '@nestjs/testing';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { GetNoteNamesByUserIdTransactionScript } from '../get-note-names-by-user-id.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { createMock } from 'src/notes/test-utils/mock-factories';

describe('GetNoteNamesByUserIdTransactionScript', () => {
  let target: GetNoteNamesByUserIdTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      getNoteNamesByUserId: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetNoteNamesByUserIdTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<GetNoteNamesByUserIdTransactionScript>(
      GetNoteNamesByUserIdTransactionScript
    );
  });

  describe('apply', () => {
    it('should report hasMore true when the returned page is full', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const rows = [
        { name: 'Note A', id: 1, isMemo: 1, folderId: null, pinned: false },
        { name: 'Note B', id: 2, isMemo: 0, folderId: 5, pinned: true },
      ];
      mockRepository.getNoteNamesByUserId.mockResolvedValue(rows);

      // Act
      const result = await target.apply({ userId, cursor: 2, limit: 2 });

      // Assert
      expect(mockRepository.getNoteNamesByUserId).toHaveBeenCalledWith(
        userId,
        2,
        2,
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual({ notes: rows, hasMore: true, nextCursor: 5 });
    });

    it('should report hasMore false when the returned page is short and forward filters', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      mockRepository.getNoteNamesByUserId.mockResolvedValue([
        { name: 'Note A', id: 1, isMemo: 0, folderId: null, pinned: false },
      ]);

      // Act
      const result = await target.apply({
        userId,
        cursor: 0,
        limit: 20,
        query: 'foo',
        type: 'memo',
        tagId: '7',
      });

      // Assert
      expect(mockRepository.getNoteNamesByUserId).toHaveBeenCalledWith(
        userId,
        0,
        20,
        'foo',
        'memo',
        '7'
      );
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBe(21);
    });
  });
});
