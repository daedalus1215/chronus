import { Test } from '@nestjs/testing';
import { UpdateNoteTransactionScript } from '../update-note.transaction.script';
import { NoteMemoTagRepository } from '../../../../infra/repositories/note-memo-tag.repository';
import { NoteDtoToEntityConverter } from '../note-dto-to-entity.converter';
import { NotFoundException } from '@nestjs/common';
import { createMock, createMockNote, createMockUpdateNoteDto } from 'src/notes/test-utils/mock-factories';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';

describe('UpdateNoteTransactionScript', () => {
  let target: UpdateNoteTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;
  let mockConverter: jest.Mocked<NoteDtoToEntityConverter>;

  beforeEach(async () => {
    // Arrange
    mockRepository = createMock<NoteMemoTagRepository>({
      findById: jest.fn(),
      save: jest.fn()
    });

    mockConverter = createMock<NoteDtoToEntityConverter>({
      apply: jest.fn()
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateNoteTransactionScript,
        {
          provide: NoteMemoTagRepository,
          useValue: mockRepository,
        },
        {
          provide: NoteDtoToEntityConverter,
          useValue: mockConverter,
        },
      ],
    }).compile();

    target = moduleRef.get<UpdateNoteTransactionScript>(UpdateNoteTransactionScript);
  });

  describe('apply', () => {
    describe('when note exists', () => {
      it('should update and return the note', async () => {
        // Arrange
        const noteId = 1;
        const existingNote = createMockNote({ id: noteId });
        const updateDto = createMockUpdateNoteDto();
        const updatedNote = { ...existingNote, name: updateDto.name };
        const userId = 'user1';
        mockRepository.findById.mockResolvedValue(existingNote);
        mockConverter.apply.mockReturnValue(updatedNote);
        mockRepository.save.mockResolvedValue(updatedNote);

        // Act
        const result = await target.apply(noteId, updateDto, userId);

        // Assert
        expect(result).toBeInstanceOf(NoteResponseDto);
        expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
        expect(mockConverter.apply).toHaveBeenCalledWith(updateDto, existingNote);
        expect(mockRepository.save).toHaveBeenCalledWith(updatedNote);
      });
    });

    describe('when note does not exist', () => {
      it('should throw NotFoundException', async () => {
        // Arrange
        const noteId = 999;
        const updateDto = createMockUpdateNoteDto();
        const userId = 1;

        mockRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(target.apply(noteId, updateDto, userId))
          .rejects
          .toThrow(NotFoundException);

        expect(mockRepository.findById).toHaveBeenCalledWith(noteId, userId);
        expect(mockConverter.apply).not.toHaveBeenCalled();
        expect(mockRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('when repository operations fail', () => {
      it('should propagate repository errors', async () => {
        // Arrange
        const noteId = 1;
        const updateDto = createMockUpdateNoteDto();
        const dbError = new Error('Database error');
        const userId = 1;

        mockRepository.findById.mockRejectedValue(dbError);

        // Act & Assert
        await expect(target.apply(noteId, updateDto, userId))
          .rejects
          .toThrow(dbError);

        expect(mockConverter.apply).not.toHaveBeenCalled();
        expect(mockRepository.save).not.toHaveBeenCalled();
      });
    });
  });
}); 