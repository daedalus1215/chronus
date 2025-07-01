import { Test } from '@nestjs/testing';
import { GetTagsByNoteIdTransactionScript } from '../get-tags-by-note-id.transaction.script';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { NotFoundException } from '@nestjs/common';
import { Tag } from 'src/notes/domain/entities/tag/tag.entity';
import { TagResponseDto } from 'src/notes/apps/dtos/responses/tag.response.dto';

describe('GetTagsByNoteIdTransactionScript', () => {
  let target: GetTagsByNoteIdTransactionScript;
  let mockRepository: jest.Mocked<NoteMemoTagRepository>;

  beforeEach(async () => {
    mockRepository = {
      findTagsByNoteId: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByNoteIdTransactionScript,
        { provide: NoteMemoTagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByNoteIdTransactionScript);
  });

  it('should return TagResponseDto[] for valid noteId and userId', async () => {
    const noteId = 1;
    const userId = 'user1';
    const tags = [
      { id: 'tag1', name: 'Tag1', userId } as Tag,
      { id: 'tag2', name: 'Tag2', userId } as Tag,
    ];
    mockRepository.findTagsByNoteId.mockResolvedValue(tags);
    const result = await target.apply(noteId, userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(TagResponseDto);
  });

  it('should throw NotFoundException if no tags found', async () => {
    mockRepository.findTagsByNoteId.mockResolvedValue([]);
    await expect(target.apply(1, 'user1')).rejects.toThrow(NotFoundException);
  });
}); 