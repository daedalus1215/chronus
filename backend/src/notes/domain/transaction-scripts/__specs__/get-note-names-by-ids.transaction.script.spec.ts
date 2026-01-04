import { Test, TestingModule } from '@nestjs/testing';
import { GetNoteNamesByIdsTransactionScript } from '../get-note-names-by-ids.transaction.script';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

describe('GetNoteNamesByIdsTransactionScript', () => {
  let target: GetNoteNamesByIdsTransactionScript;
  let mockNoteRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getNoteNamesByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNoteNamesByIdsTransactionScript,
        {
          provide: NoteMemoTagRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    target = module.get<GetNoteNamesByIdsTransactionScript>(
      GetNoteNamesByIdsTransactionScript
    );
    mockNoteRepository = module.get(NoteMemoTagRepository);
  });

  describe('apply', () => {
    it('should return note names for given note IDs', async () => {
      // Arrange
      const noteIds = [1, 2, 3];
      const userId = 123;
      const expectedNotes = [
        { id: 1, name: 'Note 1' },
        { id: 2, name: 'Note 2' },
        { id: 3, name: 'Note 3' },
      ];

      mockNoteRepository.getNoteNamesByIds.mockResolvedValue(expectedNotes);

      // Act
      const result = await target.apply(noteIds, userId);

      // Assert
      expect(mockNoteRepository.getNoteNamesByIds).toHaveBeenCalledWith(
        noteIds,
        userId
      );
      expect(result).toEqual(expectedNotes);
    });

    it('should return empty array when no note IDs provided', async () => {
      // Arrange
      const noteIds: number[] = [];
      const userId = 123;

      mockNoteRepository.getNoteNamesByIds.mockResolvedValue([]);

      // Act
      const result = await target.apply(noteIds, userId);

      // Assert
      expect(mockNoteRepository.getNoteNamesByIds).toHaveBeenCalledWith(
        noteIds,
        userId
      );
      expect(result).toEqual([]);
    });
  });
});
