import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagTransactionScript } from '../create-tag.transaction.script';
import { Tag } from '../../../domain/entities/tag.entity';
import { CreateTagDto } from '../../../app/actions/create-tag-action/dtos/create-tag.dto';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('CreateTagTransactionScript', () => {
  let target: CreateTagTransactionScript;
  let mockRepository: jest.Mocked<Repository<Tag>>;

  beforeEach(async () => {
    mockRepository = createMock<Repository<Tag>>({
      save: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateTagTransactionScript,
        { provide: getRepositoryToken(Tag), useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(CreateTagTransactionScript);
  });

  it('should create a tag with name, description, and userId', async () => {
    // Arrange
    const userId = generateRandomNumbers();
    const createTagDto: CreateTagDto = {
      name: 'Test Tag',
      description: 'Test Description',
      userId,
    };
    const expectedTag: Tag = {
      id: generateRandomNumbers(),
      name: createTagDto.name,
      description: createTagDto.description || '',
      userId: createTagDto.userId,
    };

    mockRepository.save.mockResolvedValue(expectedTag);

    // Act
    const result = await target.apply(createTagDto);

    // Assert
    expect(result).toEqual(expectedTag);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createTagDto.name,
        description: createTagDto.description,
        userId: createTagDto.userId,
      })
    );
  });

  it('should create a tag with only name and userId when description is not provided', async () => {
    // Arrange
    const userId = generateRandomNumbers();
    const createTagDto: CreateTagDto = {
      name: 'Test Tag',
      userId,
    };
    const expectedTag: Tag = {
      id: generateRandomNumbers(),
      name: createTagDto.name,
      description: '',
      userId: createTagDto.userId,
    };

    mockRepository.save.mockResolvedValue(expectedTag);

    // Act
    const result = await target.apply(createTagDto);

    // Assert
    expect(result).toEqual(expectedTag);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createTagDto.name,
        description: undefined,
        userId: createTagDto.userId,
      })
    );
  });

  it('should create a tag with empty description when description is empty string', async () => {
    // Arrange
    const userId = generateRandomNumbers();
    const createTagDto: CreateTagDto = {
      name: 'Test Tag',
      description: '',
      userId,
    };
    const expectedTag: Tag = {
      id: generateRandomNumbers(),
      name: createTagDto.name,
      description: '',
      userId: createTagDto.userId,
    };

    mockRepository.save.mockResolvedValue(expectedTag);

    // Act
    const result = await target.apply(createTagDto);

    // Assert
    expect(result).toEqual(expectedTag);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createTagDto.name,
        description: '',
        userId: createTagDto.userId,
      })
    );
  });
});
