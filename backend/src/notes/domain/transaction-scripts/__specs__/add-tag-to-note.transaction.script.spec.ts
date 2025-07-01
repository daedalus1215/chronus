import { Test } from '@nestjs/testing';
import { AddTagToNoteTransactionScript } from '../add-tag-to-note.transaction.script';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { NotFoundException } from '@nestjs/common';
import { createMock, createMockNote } from 'src/notes/test-utils/mock-factories';
import { Tag } from 'src/notes/domain/entities/tag/tag.entity';
import { AddTagToNoteDto } from 'src/notes/apps/dtos/requests/add-tag-to-note.dto';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';

describe('AddTagToNoteTransactionScript', () => {
  let target: AddTagToNoteTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<NoteMemoTagRepository>({
      findById: jest.fn(),
      save: jest.fn(),
      findTagByName: jest.fn(),
      createTag: jest.fn(),
      addTagToNote: jest.fn(),
      tagRepository: { findOne: jest.fn() } as any,
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AddTagToNoteTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<AddTagToNoteTransactionScript>(AddTagToNoteTransactionScript);
  });

  it('should add an existing tag to a note by tagId', async () => {
    const noteId = 1;
    const userId = 'user1';
    const tagId = 'tag1';
    const tag = { id: tagId, name: 'Tag', userId } as Tag;
    const note = createMockNote({ id: noteId, userId });
    (mockRepository.tagRepository.findOne as jest.Mock).mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue(note);

    const dto: AddTagToNoteDto = { noteId, tagId, userId };
    const result = await target.apply(dto);
    expect(result).toBeInstanceOf(NoteResponseDto);
    expect(mockRepository.tagRepository.findOne).toHaveBeenCalledWith({ where: { id: tagId } });
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tag, userId);
  });

  it('should add a tag by name, creating it if not found', async () => {
    const noteId = 1;
    const userId = 'user1';
    const tagName = 'NewTag';
    const tag = { id: 'tag2', name: tagName, userId } as Tag;
    const note = createMockNote({ id: noteId, userId });
    mockRepository.findTagByName.mockResolvedValue(null);
    mockRepository.createTag.mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue(note);

    const dto: AddTagToNoteDto = { noteId, tagName, userId };
    const result = await target.apply(dto);
    expect(result).toBeInstanceOf(NoteResponseDto);
    expect(mockRepository.findTagByName).toHaveBeenCalledWith(tagName);
    expect(mockRepository.createTag).toHaveBeenCalledWith({ name: tagName, userId });
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tag, userId);
  });

  it('should add a tag by name if it exists', async () => {
    const noteId = 1;
    const userId = 'user1';
    const tagName = 'ExistingTag';
    const tag = { id: 'tag3', name: tagName, userId } as Tag;
    const note = createMockNote({ id: noteId, userId });
    mockRepository.findTagByName.mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue(note);

    const dto: AddTagToNoteDto = { noteId, tagName, userId };
    const result = await target.apply(dto);
    expect(result).toBeInstanceOf(NoteResponseDto);
    expect(mockRepository.findTagByName).toHaveBeenCalledWith(tagName);
    expect(mockRepository.createTag).not.toHaveBeenCalled();
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tag, userId);
  });

  it('should throw NotFoundException if tag cannot be found or created', async () => {
    const noteId = 1;
    const userId = 'user1';
    mockRepository.tagRepository.findOne = jest.fn().mockResolvedValue(null);
    mockRepository.findTagByName.mockResolvedValue(null);
    mockRepository.createTag.mockResolvedValue(null);

    const dto: AddTagToNoteDto = { noteId, tagId: 'notfound', userId };
    await expect(target.apply(dto)).rejects.toThrow(NotFoundException);
  });
}); 