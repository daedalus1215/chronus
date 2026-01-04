import { Test } from '@nestjs/testing';
import { AddTagToNoteTransactionScript } from '../add-tag-to-note.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { NotFoundException } from '@nestjs/common';
import { Tag } from '../../../domain/entities/tag.entity';
import { AddTagToNoteDto } from '../../../app/dtos/requests/add-tag-to-note.dto';
import { createMock, generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { TagNote } from 'src/shared-kernel/domain/entities/tag-note.entity';

describe('AddTagToNoteTransactionScript', () => {
  let target: AddTagToNoteTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<TagRepository>({
      findTagByName: jest.fn() as jest.Mock<Promise<Tag>>,
      findTagByIdAndUserId: jest.fn() as jest.Mock<Promise<Tag>>,
      createTag: jest.fn() as jest.Mock<Promise<Tag>>,
      addTagToNote: jest.fn() as jest.Mock<Promise<TagNote>>,
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AddTagToNoteTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get<AddTagToNoteTransactionScript>(
      AddTagToNoteTransactionScript
    );
  });

  it('should add an existing tag to a note by tagId', async () => {
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tagId = generateRandomNumbers();
    const tag = { id: tagId, name: 'Tag', userId } as Tag;
    // Arrange
    mockRepository.findTagByIdAndUserId.mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue({} as Promise<TagNote>);

    const dto: AddTagToNoteDto = { noteId, tagId };
    const result = await target.apply({ ...dto, userId });
    expect(result).toBeInstanceOf(Object);
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tagId);
  });

  it('should add a tag by name, creating it if not found', async () => {
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tagName = 'NewTag';
    const tag = { id: generateRandomNumbers(), name: tagName, userId } as Tag;
    mockRepository.findTagByName.mockResolvedValue(null);
    mockRepository.createTag.mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue({} as Promise<TagNote>);

    const dto: AddTagToNoteDto = { noteId, tagName };
    const result = await target.apply({ ...dto, userId });
    expect(result).toBeInstanceOf(Object);
    expect(mockRepository.findTagByName).toHaveBeenCalledWith(tagName, userId);
    expect(mockRepository.createTag).toHaveBeenCalledWith({
      name: tagName,
      userId,
    });
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tag.id);
  });

  it('should add a tag by name if it exists', async () => {
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tagName = 'ExistingTag';
    const tag = { id: generateRandomNumbers(), name: tagName, userId } as Tag;
    mockRepository.findTagByName.mockResolvedValue(tag);
    mockRepository.addTagToNote.mockResolvedValue({} as Promise<TagNote>);

    const dto: AddTagToNoteDto = { noteId, tagName };
    const result = await target.apply({ ...dto, userId });
    expect(result).toBeInstanceOf(Object);
    expect(mockRepository.findTagByName).toHaveBeenCalledWith(tagName, userId);
    expect(mockRepository.createTag).not.toHaveBeenCalled();
    expect(mockRepository.addTagToNote).toHaveBeenCalledWith(noteId, tag.id);
  });

  it('should throw NotFoundException if tag cannot be found or created', async () => {
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    mockRepository.findTagByIdAndUserId.mockResolvedValue(null);
    mockRepository.findTagByName.mockResolvedValue(null);
    mockRepository.createTag.mockResolvedValue(null);

    const dto: AddTagToNoteDto = { noteId, tagId: generateRandomNumbers() };
    await expect(target.apply({ ...dto, userId })).rejects.toThrow(
      NotFoundException
    );
  });
});
