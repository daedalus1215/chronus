import { Test } from '@nestjs/testing';
import { GetCheckItemsByNoteTransactionScript } from '../get-check-items-by-note.transaction.script';
import { CheckItemsRepository } from '../../../../infra/repositories/check-items/check-items.repository';
import { CheckItem } from '../../../entities/check-item.entity';
import {
  createMock,
  generateRandomNumbers,
} from 'src/shared-kernel/test-utils';

const createCheckItem = (overrides: Partial<CheckItem>): CheckItem => {
  const item = new CheckItem();
  item.id = 0;
  item.name = 'check item';
  item.noteId = 1;
  item.order = 0;
  item.status = 'ready';
  item.doneDate = null;
  item.archiveDate = null;
  item.description = null;
  item.createdAt = new Date('2026-01-01T00:00:00Z');
  item.updatedAt = new Date('2026-01-01T00:00:00Z');
  Object.assign(item, overrides);
  return item;
};

describe('given: GetCheckItemsByNoteTransactionScript', () => {
  let target: GetCheckItemsByNoteTransactionScript;
  let checkItemsRepositoryMock: jest.Mocked<CheckItemsRepository>;

  beforeEach(async () => {
    // Arrange
    checkItemsRepositoryMock = createMock<CheckItemsRepository>({
      findByNoteIdWithUserValidation: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetCheckItemsByNoteTransactionScript,
        {
          provide: CheckItemsRepository,
          useValue: checkItemsRepositoryMock,
        },
      ],
    }).compile();

    target = moduleRef.get<GetCheckItemsByNoteTransactionScript>(
      GetCheckItemsByNoteTransactionScript
    );
  });

  describe('when: fetching check items for a note', () => {
    test('then: unchecked items are returned first, then checked items most recently completed first', async () => {
      // Arrange
      const noteId = generateRandomNumbers(1000, 999999);
      const userId = generateRandomNumbers(1000, 999999);
      checkItemsRepositoryMock.findByNoteIdWithUserValidation.mockResolvedValue(
        [
          createCheckItem({
            id: 1,
            order: 0,
            doneDate: new Date('2026-01-03T00:00:00Z'),
          }),
          createCheckItem({ id: 2, order: 1 }),
          createCheckItem({
            id: 3,
            order: 2,
            doneDate: new Date('2026-01-05T00:00:00Z'),
          }),
          createCheckItem({ id: 4, order: 3 }),
        ]
      );

      // Act
      const result = await target.apply(noteId, userId);

      // Assert
      expect(
        checkItemsRepositoryMock.findByNoteIdWithUserValidation
      ).toHaveBeenNthCalledWith(1, noteId, userId);
      expect(result.map(item => item.id)).toEqual([2, 4, 3, 1]);
    });

    test('then: a note without check items returns an empty list', async () => {
      // Arrange
      const noteId = generateRandomNumbers(1000, 999999);
      const userId = generateRandomNumbers(1000, 999999);
      checkItemsRepositoryMock.findByNoteIdWithUserValidation.mockResolvedValue(
        []
      );

      // Act
      const result = await target.apply(noteId, userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
