import { Test } from '@nestjs/testing';
import { UpdateTagTransactionScript } from '../update-tag.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { NotFoundException } from '@nestjs/common';
import { Tag } from '../../../domain/entities/tag.entity';
import { UpdateTagDto } from '../../../app/actions/update-tag-action/dtos/update-tag.dto';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('UpdateTagTransactionScript', () => {
  let target: UpdateTagTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<TagRepository>({
      findTagByIdAndUserId: jest.fn(),
      updateTag: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateTagTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(UpdateTagTransactionScript);
  });

  it('should update tag name when provided', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Old Name',
      description: 'Old Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      name: 'New Name',
    };
    const updatedTag: Tag = {
      ...existingTag,
      name: updateTagDto.name!,
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(updatedTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(updatedTag);
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        ...existingTag,
        name: updateTagDto.name,
      })
    );
  });

  it('should update tag description when provided', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Tag Name',
      description: 'Old Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      description: 'New Description',
    };
    const updatedTag: Tag = {
      ...existingTag,
      description: updateTagDto.description || '',
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(updatedTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(updatedTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        ...existingTag,
        description: updateTagDto.description,
      })
    );
  });

  it('should set description to empty string when description is explicitly set to empty string', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Tag Name',
      description: 'Old Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      description: '',
    };
    const updatedTag: Tag = {
      ...existingTag,
      description: '',
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(updatedTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(updatedTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        ...existingTag,
        description: '',
      })
    );
  });

  it('should not update description when description is undefined', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Tag Name',
      description: 'Old Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      description: undefined,
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(existingTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(existingTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(existingTag);
  });

  it('should update both name and description when both are provided', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Old Name',
      description: 'Old Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      name: 'New Name',
      description: 'New Description',
    };
    const updatedTag: Tag = {
      ...existingTag,
      name: updateTagDto.name!,
      description: updateTagDto.description || '',
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(updatedTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(updatedTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        ...existingTag,
        name: updateTagDto.name,
        description: updateTagDto.description,
      })
    );
  });

  it('should not update name when name is null', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Original Name',
      description: 'Original Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {
      name: null as unknown as string,
      description: 'New Description',
    };
    const updatedTag: Tag = {
      ...existingTag,
      description: updateTagDto.description || '',
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(updatedTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(updatedTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        ...existingTag,
        name: existingTag.name,
        description: updateTagDto.description,
      })
    );
  });

  it('should throw NotFoundException when tag does not exist', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const updateTagDto: UpdateTagDto = {
      name: 'New Name',
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(target.apply(tagId, userId, updateTagDto)).rejects.toThrow(
      NotFoundException
    );
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.updateTag).not.toHaveBeenCalled();
  });

  it('should not update any fields when updateTagDto is empty', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const existingTag: Tag = {
      id: tagId,
      name: 'Original Name',
      description: 'Original Description',
      userId,
    };
    const updateTagDto: UpdateTagDto = {};

    mockRepository.findTagByIdAndUserId.mockResolvedValue(existingTag);
    mockRepository.updateTag.mockResolvedValue(existingTag);

    // Act
    const result = await target.apply(tagId, userId, updateTagDto);

    // Assert
    expect(result).toEqual(existingTag);
    expect(mockRepository.updateTag).toHaveBeenCalledWith(existingTag);
  });
});
