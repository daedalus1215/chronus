import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  createMock,
  createMockNote,
} from 'src/notes/test-utils/mock-factories';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { PinNoteTransactionScript } from '../pin-note.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';

describe('PinNoteTransactionScript', () => {
  let target: PinNoteTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<NoteMemoTagRepository>({
      findById: jest.fn(),
      updatePinned: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        PinNoteTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<PinNoteTransactionScript>(PinNoteTransactionScript);
  });

  describe('apply', () => {
    it('should pin the note and return it with pinned state', async () => {
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const note = createMockNote({ id: noteId, userId });
      mockRepository.findById.mockResolvedValue(note);
      mockRepository.updatePinned.mockResolvedValue({ affected: 1 } as never);

      const result = await target.apply(noteId, userId, true);

      expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
      expect(mockRepository.updatePinned).toHaveBeenCalledWith(
        noteId,
        userId,
        true
      );
      expect(result.pinned).toBe(true);
      expect(result.pinnedAt).toBeInstanceOf(Date);
    });

    it('should unpin the note and clear pinnedAt', async () => {
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const note = createMockNote({ id: noteId, userId });
      mockRepository.findById.mockResolvedValue(note);
      mockRepository.updatePinned.mockResolvedValue({ affected: 1 } as never);

      const result = await target.apply(noteId, userId, false);

      expect(mockRepository.updatePinned).toHaveBeenCalledWith(
        noteId,
        userId,
        false
      );
      expect(result.pinned).toBe(false);
      expect(result.pinnedAt).toBeNull();
    });

    it('should throw NotFoundException if note does not exist', async () => {
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      await expect(target.apply(noteId, userId, true)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.updatePinned).not.toHaveBeenCalled();
    });

    it('should not update when the note belongs to another user', async () => {
      // findById is scoped by userId in the repository; a note for a
      // different user resolves to null, which is the 404 path above.
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockRepository.findById.mockResolvedValue(null);

      await expect(target.apply(noteId, userId, true)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.updatePinned).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const dbError = new Error('Database error');
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(target.apply(noteId, userId, true)).rejects.toThrow(
        dbError
      );
      expect(mockRepository.updatePinned).not.toHaveBeenCalled();
    });
  });
});
