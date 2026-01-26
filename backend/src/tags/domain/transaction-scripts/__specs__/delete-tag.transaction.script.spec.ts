import { Test } from '@nestjs/testing';
import { DeleteTagTransactionScript } from '../delete-tag.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { NotFoundException } from '@nestjs/common';
import { Tag } from '../../../domain/entities/tag.entity';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('DeleteTagTransactionScript', () => {
  let target: DeleteTagTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<TagRepository>({
      findTagByIdAndUserId: jest.fn(),
      removeTag: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteTagTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(DeleteTagTransactionScript);
  });

  it('should delete a tag when it exists', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tag: Tag = {
      id: tagId,
      name: 'Test Tag',
      description: 'Test Description',
      userId,
    };

    mockRepository.findTagByIdAndUserId.mockResolvedValue(tag);
    mockRepository.removeTag.mockResolvedValue(tag);

    // Act
    await target.apply(tagId, userId);

    // Assert
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.removeTag).toHaveBeenCalledWith(tag);
  });

  it('should throw NotFoundException when tag does not exist', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();

    mockRepository.findTagByIdAndUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(target.apply(tagId, userId)).rejects.toThrow(
      NotFoundException
    );
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.removeTag).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when tag belongs to different user', async () => {
    // Arrange
    const tagId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const differentUserId = generateRandomNumbers();

    mockRepository.findTagByIdAndUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(target.apply(tagId, userId)).rejects.toThrow(
      NotFoundException
    );
    expect(mockRepository.findTagByIdAndUserId).toHaveBeenCalledWith(
      tagId,
      userId
    );
    expect(mockRepository.removeTag).not.toHaveBeenCalled();
  });
});
