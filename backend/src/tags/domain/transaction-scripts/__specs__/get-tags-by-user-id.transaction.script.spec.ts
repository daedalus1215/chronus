import { Test } from '@nestjs/testing';
import { GetTagsByUserIdTransactionScript } from '../get-tags-by-user-id.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag.repository';
import { Tag } from '../../../domain/entities/tag.entity';
import { TagResponseDto } from '../../../app/dtos/responses/tag.response.dto';

describe('GetTagsByUserIdTransactionScript', () => {
  let target: GetTagsByUserIdTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = {
      getTagsByUserId: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByUserIdTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByUserIdTransactionScript);
  });

  it('should return TagResponseDto[] for valid userId', async () => {
    const userId = 'user1';
    const tags = [
      { id: 'tag1', name: 'Tag1', userId } as Tag,
      { id: 'tag2', name: 'Tag2', userId } as Tag,
    ];
    mockRepository.getTagsByUserId.mockResolvedValue(tags);
    const result = await target.apply(userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(TagResponseDto);
  });
}); 