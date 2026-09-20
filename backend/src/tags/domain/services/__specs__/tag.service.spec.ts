import { Test } from '@nestjs/testing';
import { TagService } from '../tag.service';
import { AddTagToNoteTransactionScript } from '../../transaction-scripts/add-tag-to-note-TS/add-tag-to-note.transaction.script';
import { GetTagsByNoteIdTransactionScript } from '../../transaction-scripts/get-tags-by-note-id-TS/get-tags-by-note-id.transaction.script';
import { GetTagsByUserIdTransactionScript } from '../../transaction-scripts/get-tags-by-user-id-TS/get-tags-by-user-id.transaction.script';
import { DeleteTagTransactionScript } from '../../transaction-scripts/delete-tag-TS/delete-tag.transaction.script';
import { GetTagByIdTransactionScript } from '../../transaction-scripts/get-tag-by-id-TS/get-tag-by-id.transaction.script';
import { RemoveTagFromNoteTransactionScript } from '../../transaction-scripts/remove-tag-from-note-TS/remove-tag-from-note.transaction.script';
import { UpdateTagTransactionScript } from '../../transaction-scripts/update-tag-TS/update-tag.transaction.script';
import { AddTagToNoteDto } from '../../../apps/dtos/requests/add-tag-to-note.dto';
import { TagResponseDto } from '../../../apps/dtos/responses/tag.response.dto';
import { Tag } from '../../entities/tag.entity';
import { GetTagsByUserIdProjection } from '../../transaction-scripts/get-tags-by-user-id-TS/get-tags-by-user-id.projection';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { createMock } from 'src/shared-kernel/test-utils';

describe('TagService', () => {
  let target: TagService;
  let mockAddTagToNoteTS: jest.Mocked<AddTagToNoteTransactionScript>;
  let mockGetTagsByNoteIdTS: jest.Mocked<GetTagsByNoteIdTransactionScript>;
  let mockGetTagsByUserIdTS: jest.Mocked<GetTagsByUserIdTransactionScript>;
  let mockDeleteTagTS: jest.Mocked<DeleteTagTransactionScript>;
  let mockGetTagByIdTS: jest.Mocked<GetTagByIdTransactionScript>;
  let mockRemoveTagFromNoteTS: jest.Mocked<RemoveTagFromNoteTransactionScript>;
  let mockUpdateTagTS: jest.Mocked<UpdateTagTransactionScript>;
  beforeEach(async () => {
    mockAddTagToNoteTS = createMock<AddTagToNoteTransactionScript>({
      apply: jest.fn(),
    });
    mockGetTagsByNoteIdTS = createMock<GetTagsByNoteIdTransactionScript>({
      apply: jest.fn(),
    });
    mockGetTagsByUserIdTS = createMock<GetTagsByUserIdTransactionScript>({
      apply: jest.fn(),
    });
    mockDeleteTagTS = createMock<DeleteTagTransactionScript>({
      apply: jest.fn(),
    });
    mockGetTagByIdTS = createMock<GetTagByIdTransactionScript>({
      apply: jest.fn(),
    });
    mockRemoveTagFromNoteTS = createMock<RemoveTagFromNoteTransactionScript>({
      apply: jest.fn(),
    });
    mockUpdateTagTS = createMock<UpdateTagTransactionScript>({
      apply: jest.fn(),
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: AddTagToNoteTransactionScript,
          useValue: mockAddTagToNoteTS,
        },
        {
          provide: GetTagsByNoteIdTransactionScript,
          useValue: mockGetTagsByNoteIdTS,
        },
        {
          provide: GetTagsByUserIdTransactionScript,
          useValue: mockGetTagsByUserIdTS,
        },
        {
          provide: DeleteTagTransactionScript,
          useValue: mockDeleteTagTS,
        },
        {
          provide: GetTagByIdTransactionScript,
          useValue: mockGetTagByIdTS,
        },
        {
          provide: RemoveTagFromNoteTransactionScript,
          useValue: mockRemoveTagFromNoteTS,
        },
        {
          provide: UpdateTagTransactionScript,
          useValue: mockUpdateTagTS,
        },
      ],
    }).compile();

    target = moduleRef.get(TagService);
  });

  describe('addTagToNote', () => {
    it('should delegate to AddTagToNoteTransactionScript', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const tagId = generateRandomNumbers();
      const dto: AddTagToNoteDto & { userId: number } = {
        noteId,
        tagId,
        userId,
      };
      const expectedTag: Tag = {
        id: tagId,
        name: 'Test Tag',
        description: 'Test Description',
        userId,
      };

      mockAddTagToNoteTS.apply.mockResolvedValue(expectedTag);

      // Act
      const result = await target.addTagToNote(dto);

      // Assert
      expect(result).toEqual(expectedTag);
      expect(mockAddTagToNoteTS.apply).toHaveBeenCalledWith(dto);
      expect(mockAddTagToNoteTS.apply).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTagsByNoteId', () => {
    it('should delegate to GetTagsByNoteIdTransactionScript', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const expectedTags: TagResponseDto[] = [
        new TagResponseDto({
          id: generateRandomNumbers(),
          name: 'Tag1',
          description: 'Description1',
          userId,
        }),
        new TagResponseDto({
          id: generateRandomNumbers(),
          name: 'Tag2',
          description: 'Description2',
          userId,
        }),
      ];

      mockGetTagsByNoteIdTS.apply.mockResolvedValue(expectedTags);

      // Act
      const result = await target.getTagsByNoteId(noteId);

      // Assert
      expect(result).toEqual(expectedTags);
      expect(mockGetTagsByNoteIdTS.apply).toHaveBeenCalledWith(noteId);
      expect(mockGetTagsByNoteIdTS.apply).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when note has no tags', async () => {
      // Arrange
      const noteId = generateRandomNumbers();

      mockGetTagsByNoteIdTS.apply.mockResolvedValue([]);

      // Act
      const result = await target.getTagsByNoteId(noteId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetTagsByNoteIdTS.apply).toHaveBeenCalledWith(noteId);
    });
  });

  describe('getTagsByUserId', () => {
    it('should delegate to GetTagsByUserIdTransactionScript', async () => {
      // Arrange
      const userId = generateRandomNumbers();
      const expectedProjections: GetTagsByUserIdProjection[] = [
        {
          id: '1',
          name: 'Tag1',
          noteCount: 5,
        },
        {
          id: '2',
          name: 'Tag2',
          noteCount: 3,
        },
      ];

      mockGetTagsByUserIdTS.apply.mockResolvedValue(expectedProjections);

      // Act
      const result = await target.getTagsByUserId(userId);

      // Assert
      expect(result).toEqual(expectedProjections);
      expect(mockGetTagsByUserIdTS.apply).toHaveBeenCalledWith(userId);
      expect(mockGetTagsByUserIdTS.apply).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no tags', async () => {
      // Arrange
      const userId = generateRandomNumbers();

      mockGetTagsByUserIdTS.apply.mockResolvedValue([]);

      // Act
      const result = await target.getTagsByUserId(userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetTagsByUserIdTS.apply).toHaveBeenCalledWith(userId);
    });
  });
});
