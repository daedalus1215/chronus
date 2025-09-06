import { Test } from '@nestjs/testing';
import { GetTagsByNoteIdTransactionScript } from '../get-tags-by-note-id.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { NotFoundException } from '@nestjs/common';
import { Tag } from '../../../domain/entities/tag.entity';
import { TagResponseDto } from '../../../app/dtos/responses/tag.response.dto';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('GetTagsByNoteIdTransactionScript', () => {
  let target: GetTagsByNoteIdTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = {
      findTagsByNoteId: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByNoteIdTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByNoteIdTransactionScript);
  });

  it('should return TagResponseDto[] for valid noteId and userId', async () => {
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tags:Tag[] = [
      { id: 'tag1', name: 'Tag1', description: 'Tag1 description', userId: userId },
      { id: 'tag2', name: 'Tag2', description: 'Tag2 description', userId: userId },
    ];
    // Arrange
    mockRepository.findTagsByNoteId.mockResolvedValue(tags);
    const result = await target.apply(noteId);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(TagResponseDto);
  });

  it('should throw NotFoundException if no tags found', async () => {
    mockRepository.findTagsByNoteId.mockResolvedValue([]);
    await expect(target.apply(generateRandomNumbers())).rejects.toThrow(NotFoundException);
  });
}); 