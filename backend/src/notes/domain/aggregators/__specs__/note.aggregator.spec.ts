import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { NoteAggregator } from '../note.aggregator';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { GetNoteNamesByIdsTransactionScript } from 'src/notes/domain/transaction-scripts/get-note-names-by-ids.transaction.script';
import {
  createMock,
  createMockNote,
} from 'src/notes/test-utils/mock-factories';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';

describe('NoteAggregator', () => {
  let target: NoteAggregator;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;
  let mockGetNoteNamesByIdsTS: jest.Mocked<GetNoteNamesByIdsTransactionScript>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      findById: jest.fn(),
      findMemoById: jest.fn(),
      save: jest.fn(),
    });
    mockGetNoteNamesByIdsTS = createMock<GetNoteNamesByIdsTransactionScript>({
      apply: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        NoteAggregator,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
        {
          provide: GetNoteNamesByIdsTransactionScript,
          useValue: mockGetNoteNamesByIdsTS,
        },
      ],
    }).compile();

    target = moduleRef.get<NoteAggregator>(NoteAggregator);
  });

  describe('exists', () => {
    it('should return false when the note is missing', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await target.exists(noteId, userId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
      expect(result).toBe(false);
    });

    it('should return true when the note exists', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(
        createMockNote({ id: noteId, userId })
      );

      // Act
      const result = await target.exists(noteId, userId);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isArchived', () => {
    it('should return true for an archived note', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(
        createMockNote({ id: noteId, archivedAt: new Date() })
      );

      // Act
      const result = await target.isArchived(noteId, userId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for a note that is not archived', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(
        createMockNote({ id: noteId, archivedAt: null })
      );

      // Act
      const result = await target.isArchived(noteId, userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should treat a missing note as archived (hidden from lists)', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await target.isArchived(noteId, userId);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getReference', () => {
    it('should throw NotFoundException when the note is missing', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      // Act / Assert
      await expect(target.getReference(noteId, userId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when the note belongs to another user', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(
        createMockNote({ id: noteId, userId: userId + 1 })
      );

      // Act / Assert
      await expect(target.getReference(noteId, userId)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should return the id, name and userId of the note', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(
        createMockNote({ id: noteId, name: 'Ref Note', userId })
      );

      // Act
      const result = await target.getReference(noteId, userId);

      // Assert
      expect(result).toEqual({ id: noteId, name: 'Ref Note', userId });
    });
  });

  describe('createNoteWithMemo', () => {
    it('should attach a memo when a description is provided', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const savedNote = createMockNote({ name: 'New Memo', userId });
      mockRepository.save.mockResolvedValue(savedNote);

      // Act
      const id = await target.createNoteWithMemo(
        'New Memo',
        'some body',
        userId
      );

      // Assert
      expect(id).toBe(savedNote.id);
      const persisted = mockRepository.save.mock.calls[0][0];
      expect(persisted.name).toBe('New Memo');
      expect(persisted.userId).toBe(userId);
      expect(persisted.memo).toBeInstanceOf(Memo);
      expect((persisted.memo as Memo).description).toBe('some body');
    });

    it('should not attach a memo when no description is provided', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const savedNote = createMockNote({ name: 'Plain Note', userId });
      mockRepository.save.mockResolvedValue(savedNote);

      // Act
      await target.createNoteWithMemo('Plain Note', undefined, userId);

      // Assert
      const persisted = mockRepository.save.mock.calls[0][0];
      expect(persisted.memo).toBeFalsy();
    });
  });

  describe('replaceDescription', () => {
    it('should throw NotFoundException when the note is missing', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      // Act / Assert
      await expect(target.replaceDescription(noteId, 'body')).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should replace the description on the existing memo', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const existingMemo = new Memo();
      existingMemo.description = 'old body';
      const note = createMockNote({ id: noteId, memo: existingMemo });
      mockRepository.findById.mockResolvedValue(note);
      mockRepository.save.mockResolvedValue(note);

      // Act
      await target.replaceDescription(noteId, 'new body');

      // Assert
      expect(existingMemo.description).toBe('new body');
      expect(mockRepository.save).toHaveBeenCalledWith(note);
    });

    it('should attach a new memo when the note has none', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const note = createMockNote({ id: noteId, memo: null });
      mockRepository.findById.mockResolvedValue(note);
      mockRepository.save.mockResolvedValue(note);

      // Act
      await target.replaceDescription(noteId, 'first body');

      // Assert
      expect(note.memo).toBeInstanceOf(Memo);
      expect(note.memo.description).toBe('first body');
      expect(mockRepository.save).toHaveBeenCalledWith(note);
    });
  });

  describe('archiveNotes', () => {
    it('should archive only the notes that exist and skip missing ids', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const foundId = generateRandomNumbers();
      const missingId = generateRandomNumbers();
      const note = createMockNote({ id: foundId, archivedAt: null });
      mockRepository.findById
        .mockResolvedValueOnce(note)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(note);

      // Act
      await target.archiveNotes([foundId, missingId], userId);

      // Assert
      expect(note.archivedAt).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(note);
    });
  });
});
