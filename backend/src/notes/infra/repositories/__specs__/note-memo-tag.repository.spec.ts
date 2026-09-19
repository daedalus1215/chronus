import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { NoteMemoTagRepository } from '../note-memo-tag.repository';
import {
  createMock,
  createMockNote,
} from 'src/notes/test-utils/mock-factories';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';

describe('NoteMemoTagRepository', () => {
  let target: NoteMemoTagRepository;
  let mockNoteRepository: jest.Mocked<Repository<Note>>;
  let mockMemoRepository: jest.Mocked<Repository<Memo>>;

  beforeEach(async () => {
    // Arrange
    mockNoteRepository = createMock<Repository<Note>>({
      save: jest.fn(),
      delete: jest.fn(),
    });
    mockMemoRepository = createMock<Repository<Memo>>({
      save: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        NoteMemoTagRepository,
        { provide: getRepositoryToken(Note), useValue: mockNoteRepository },
        { provide: getRepositoryToken(Memo), useValue: mockMemoRepository },
      ],
    }).compile();

    target = moduleRef.get<NoteMemoTagRepository>(NoteMemoTagRepository);
  });

  describe('save', () => {
    it('should persist the memo before the note and attach the saved memo', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const memo = new Memo();
      memo.description = 'body';
      const savedMemo = { ...memo, id: 77 } as Memo;
      const note = createMockNote({ userId, memo });
      const savedNote = createMockNote({ userId, memo: savedMemo });
      mockMemoRepository.save.mockResolvedValue(savedMemo);
      mockNoteRepository.save.mockResolvedValue(savedNote);

      // Act
      const result = await target.save(note);

      // Assert
      expect(mockMemoRepository.save).toHaveBeenCalledWith(memo);
      expect(mockNoteRepository.save).toHaveBeenCalledWith(note);
      const memoOrder = mockMemoRepository.save.mock.invocationCallOrder[0];
      const noteOrder = mockNoteRepository.save.mock.invocationCallOrder[0];
      expect(memoOrder).toBeLessThan(noteOrder);
      expect(note.memo).toBe(savedMemo);
      expect(result).toBe(savedNote);
    });

    it('should not touch the memo repository when the note has no memo', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const note = createMockNote({ userId, memo: null });
      mockNoteRepository.save.mockResolvedValue(note);

      // Act
      await target.save(note);

      // Assert
      expect(mockMemoRepository.save).not.toHaveBeenCalled();
      expect(mockNoteRepository.save).toHaveBeenCalledWith(note);
    });
  });

  describe('deleteNoteById', () => {
    it('should delete only the note owned by the user', async () => {
      // Arrange
      const id = generateRandomNumbers();
      const userId = generateRandomNumbers();

      // Act
      await target.deleteNoteById(id, userId);

      // Assert
      expect(mockNoteRepository.delete).toHaveBeenCalledWith({ id, userId });
    });
  });
});
