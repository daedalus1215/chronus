import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createMock,
  createMockNote,
} from 'src/notes/test-utils/mock-factories';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { CreateNoteTransactionScript } from '../create-note.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';

describe('CreateNoteTransactionScript', () => {
  let target: CreateNoteTransactionScript;
  let mockNoteRepository: jest.Mocked<NoteMemoTagRepository>;
  let mockMemoRepository: jest.Mocked<Repository<Memo>>;

  beforeEach(async () => {
    // Arrange
    mockNoteRepository = createMock<NoteMemoTagRepository>({
      save: jest.fn(),
    });
    mockMemoRepository = createMock<Repository<Memo>>({
      save: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateNoteTransactionScript,
        { provide: getRepositoryToken(Note), useValue: mockNoteRepository },
        {
          provide: getRepositoryToken(Memo),
          useValue: mockMemoRepository,
        },
      ],
    }).compile();

    target = moduleRef.get<CreateNoteTransactionScript>(
      CreateNoteTransactionScript
    );
  });

  describe('apply', () => {
    it('should persist the note with name, user and folder', async () => {
      // Arrange
      const command = {
        name: 'My Note',
        userId: generateRandomNumbers(),
        folderId: 42,
      };
      const savedNote = createMockNote({
        name: command.name,
        userId: command.userId,
        folderId: command.folderId,
      });
      mockNoteRepository.save.mockResolvedValue(savedNote);

      // Act
      const result = await target.apply(command);

      // Assert
      expect(mockNoteRepository.save).toHaveBeenCalledTimes(1);
      const persisted = mockNoteRepository.save.mock.calls[0][0] as Note;
      expect(persisted.name).toBe(command.name);
      expect(persisted.userId).toBe(command.userId);
      expect(persisted.folderId).toBe(42);
      expect(mockMemoRepository.save).not.toHaveBeenCalled();
      expect(result).toBe(savedNote);
    });

    it('should default folderId to null when omitted', async () => {
      // Arrange
      const command = { name: 'Root Note', userId: generateRandomNumbers() };
      const savedNote = createMockNote({
        name: command.name,
        userId: command.userId,
        folderId: null,
      });
      mockNoteRepository.save.mockResolvedValue(savedNote);

      // Act
      await target.apply(command);

      // Assert
      const persisted = mockNoteRepository.save.mock.calls[0][0] as Note;
      expect(persisted.folderId).toBeNull();
    });

    it('should attach a memo with empty description when isMemo is set', async () => {
      // Arrange
      const command = {
        name: 'My Memo',
        userId: generateRandomNumbers(),
        isMemo: true,
      };
      const savedMemo = new Memo();
      savedMemo.description = '';
      mockMemoRepository.save.mockResolvedValue(savedMemo);
      const savedNote = createMockNote({
        name: command.name,
        memo: savedMemo,
      });
      mockNoteRepository.save.mockResolvedValue(savedNote);

      // Act
      await target.apply(command);

      // Assert
      const savedMemoArg = mockMemoRepository.save.mock.calls[0][0] as Memo;
      expect(savedMemoArg.description).toBe('');
      const persisted = mockNoteRepository.save.mock.calls[0][0] as Note;
      expect(persisted.memo).toBe(savedMemo);
    });
  });
});
