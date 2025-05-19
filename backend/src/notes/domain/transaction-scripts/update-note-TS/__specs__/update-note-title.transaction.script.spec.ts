import { Test } from '@nestjs/testing';
import { UpdateNoteTitleTransactionScript } from '../update-note-title.transaction.script';
import { NoteMemoTagRepository } from '../../../../infra/repositories/note-memo-tag.repository';
import { NotFoundException } from '@nestjs/common';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';
import { createMock, createMockNote } from 'src/notes/test-utils/mock-factories';

const createMockUpdateNoteTitleDto = (overrides = {}) => ({ name: 'New Title', ...overrides });

describe('UpdateNoteTitleTransactionScript', () => {
  let target: UpdateNoteTitleTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<NoteMemoTagRepository>({
      findById: jest.fn(),
      save: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateNoteTitleTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<UpdateNoteTitleTransactionScript>(UpdateNoteTitleTransactionScript);
  });

  describe('apply', () => {
    it('should update and return the note title', async () => {
      const noteId = 1;
      const userId = 'user1';
      const existingNote = createMockNote({ id: noteId, userId });
      const updateDto = createMockUpdateNoteTitleDto();
      const updatedNote = { ...existingNote, name: updateDto.name };

      mockRepository.findById.mockResolvedValue(existingNote);
      mockRepository.save.mockResolvedValue(updatedNote);

      const result = await target.apply(noteId, updateDto, userId);

      expect(result).toBeInstanceOf(NoteResponseDto);
      expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
      expect(mockRepository.save).toHaveBeenCalledWith({ ...existingNote, name: updateDto.name });
    });

    it('should throw NotFoundException if note does not exist', async () => {
      const noteId = 999;
      const userId = 'user1';
      const updateDto = createMockUpdateNoteTitleDto();
      mockRepository.findById.mockResolvedValue(null);

      await expect(target.apply(noteId, updateDto, userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const noteId = 1;
      const userId = 'user1';
      const updateDto = createMockUpdateNoteTitleDto();
      const dbError = new Error('Database error');
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(target.apply(noteId, updateDto, userId)).rejects.toThrow(dbError);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
}); 