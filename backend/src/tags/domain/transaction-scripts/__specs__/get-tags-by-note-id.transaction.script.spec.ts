import { Test } from '@nestjs/testing';
import { GetTagsByNoteIdTransactionScript } from '../get-tags-by-note-id.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { Tag } from '../../../domain/entities/tag.entity';
import { TagResponseDto } from '../../../app/dtos/responses/tag.response.dto';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('GetTagsByNoteIdTransactionScript', () => {
  let target: GetTagsByNoteIdTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<TagRepository>({
      findTagsByNoteId: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByNoteIdTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByNoteIdTransactionScript);
  });

  it('should return TagResponseDto[] for valid noteId and userId', async () => {
    // Arrange
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tags: Tag[] = [
      {
        id: generateRandomNumbers(),
        name: 'Tag1',
        description: 'Tag1 description',
        userId,
      },
      {
        id: generateRandomNumbers(),
        name: 'Tag2',
        description: 'Tag2 description',
        userId,
      },
    ];

    mockRepository.findTagsByNoteId.mockResolvedValue(tags);

    // Act
    const result = await target.apply(noteId);

    // Assert
    expect(result).toEqual(tags.map(tag => new TagResponseDto(tag)));
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(TagResponseDto);
  });
});
