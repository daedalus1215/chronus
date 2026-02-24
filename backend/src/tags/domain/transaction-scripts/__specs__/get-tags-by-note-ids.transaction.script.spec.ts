import { Test } from '@nestjs/testing';
import { GetTagsByNoteIdsTransactionScript } from '../get-tags-by-note-ids.transaction.script';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { Tag } from '../../../domain/entities/tag.entity';
import { TagResponseDto } from '../../../app/dtos/responses/tag.response.dto';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('GetTagsByNoteIdsTransactionScript', () => {
  let target: GetTagsByNoteIdsTransactionScript;
  let mockRepository: jest.Mocked<TagRepository>;

  beforeEach(async () => {
    mockRepository = createMock<TagRepository>({
      findTagsByNoteIds: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTagsByNoteIdsTransactionScript,
        { provide: TagRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetTagsByNoteIdsTransactionScript);
  });

  it('should return empty Map for empty noteIds array', async () => {
    // Arrange
    const noteIds: number[] = [];

    // Act
    const result = await target.apply(noteIds);

    // Assert
    expect(result).toEqual(new Map());
    expect(result.size).toBe(0);
    expect(mockRepository.findTagsByNoteIds).not.toHaveBeenCalled();
  });

  it('should return Map with TagResponseDto[] for single noteId with tags', async () => {
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

    mockRepository.findTagsByNoteIds.mockResolvedValue(
      new Map([[noteId, tags]])
    );

    // Act
    const result = await target.apply([noteId]);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get(noteId)).toEqual(
      tags.map(tag => new TagResponseDto(tag))
    );
    expect(result.get(noteId)).toHaveLength(2);
    expect(result.get(noteId)?.[0]).toBeInstanceOf(TagResponseDto);
    expect(mockRepository.findTagsByNoteIds).toHaveBeenCalledWith([noteId]);
  });

  it('should return Map with empty array for noteId without tags', async () => {
    // Arrange
    const noteId = generateRandomNumbers();

    mockRepository.findTagsByNoteIds.mockResolvedValue(new Map([[noteId, []]]));

    // Act
    const result = await target.apply([noteId]);

    // Assert
    expect(result.size).toBe(1);
    expect(result.get(noteId)).toEqual([]);
    expect(mockRepository.findTagsByNoteIds).toHaveBeenCalledWith([noteId]);
  });

  it('should return Map with TagResponseDto[] for multiple noteIds', async () => {
    // Arrange
    const noteId1 = generateRandomNumbers();
    const noteId2 = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tags1: Tag[] = [
      {
        id: generateRandomNumbers(),
        name: 'Tag1',
        description: 'Tag1 description',
        userId,
      },
    ];
    const tags2: Tag[] = [
      {
        id: generateRandomNumbers(),
        name: 'Tag2',
        description: 'Tag2 description',
        userId,
      },
      {
        id: generateRandomNumbers(),
        name: 'Tag3',
        description: 'Tag3 description',
        userId,
      },
    ];

    mockRepository.findTagsByNoteIds.mockResolvedValue(
      new Map([
        [noteId1, tags1],
        [noteId2, tags2],
      ])
    );

    // Act
    const result = await target.apply([noteId1, noteId2]);

    // Assert
    expect(result.size).toBe(2);
    expect(result.get(noteId1)).toEqual(
      tags1.map(tag => new TagResponseDto(tag))
    );
    expect(result.get(noteId2)).toEqual(
      tags2.map(tag => new TagResponseDto(tag))
    );
    expect(result.get(noteId1)).toHaveLength(1);
    expect(result.get(noteId2)).toHaveLength(2);
    expect(mockRepository.findTagsByNoteIds).toHaveBeenCalledWith([
      noteId1,
      noteId2,
    ]);
  });

  it('should convert Tag entities to TagResponseDto', async () => {
    // Arrange
    const noteId = generateRandomNumbers();
    const userId = generateRandomNumbers();
    const tag: Tag = {
      id: generateRandomNumbers(),
      name: 'Test Tag',
      description: 'Test Description',
      userId,
    };

    mockRepository.findTagsByNoteIds.mockResolvedValue(
      new Map([[noteId, [tag]]])
    );

    // Act
    const result = await target.apply([noteId]);

    // Assert
    const resultTags = result.get(noteId);
    expect(resultTags).toHaveLength(1);
    expect(resultTags?.[0]).toBeInstanceOf(TagResponseDto);
    expect(resultTags?.[0].id).toBe(tag.id);
    expect(resultTags?.[0].name).toBe(tag.name);
    expect(resultTags?.[0].description).toBe(tag.description);
  });
});
