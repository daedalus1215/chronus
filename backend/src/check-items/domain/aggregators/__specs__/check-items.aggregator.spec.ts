import { Test } from '@nestjs/testing';
import { CheckItemsAggregator } from '../check-items.aggregator';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';
import { GetCheckItemsByNoteTransactionScript } from '../../transaction-scripts/get-check-items-by-note-TS/get-check-items-by-note.transaction.script';
import { CheckItem } from '../../entities/check-item.entity';
import {
  createMock,
  generateRandomNumbers,
} from 'src/shared-kernel/test-utils';

describe('CheckItemsAggregator', () => {
  let target: CheckItemsAggregator;
  let mockRepo: jest.Mocked<CheckItemsRepository>;
  let mockGetByNoteTS: jest.Mocked<GetCheckItemsByNoteTransactionScript>;
  const noteId = generateRandomNumbers(1000, 999999);
  const userId = generateRandomNumbers(1000000, 9999999);

  beforeEach(async () => {
    mockRepo = createMock<CheckItemsRepository>({
      searchByQuery: jest.fn(),
      deleteByNoteId: jest.fn(),
      findByNoteId: jest.fn(),
      findByNoteIdWithUserValidation: jest.fn(),
      saveMany: jest.fn(),
    });
    mockGetByNoteTS = createMock<GetCheckItemsByNoteTransactionScript>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckItemsAggregator,
        { provide: CheckItemsRepository, useValue: mockRepo },
        {
          provide: GetCheckItemsByNoteTransactionScript,
          useValue: mockGetByNoteTS,
        },
      ],
    }).compile();

    target = moduleRef.get(CheckItemsAggregator);
  });

  const makeItem = (overrides: Partial<CheckItem> = {}): CheckItem => {
    const item = new CheckItem();
    item.name = 'item';
    item.noteId = noteId;
    item.status = 'ready';
    item.order = 0;
    Object.assign(item, overrides);
    return item;
  };

  describe('findByNoteId', () => {
    it('validates ownership and returns non-archived items first, stably within each group', async () => {
      const archived1 = makeItem({
        id: 1,
        name: 'archived-1',
        order: 0,
        doneDate: new Date('2026-08-01T00:00:00Z'),
        archiveDate: new Date('2026-08-02T00:00:00Z'),
      });
      const active1 = makeItem({
        id: 2,
        name: 'active-1',
        order: 1,
        doneDate: null,
      });
      const archived2 = makeItem({
        id: 3,
        name: 'archived-2',
        order: 2,
        doneDate: new Date('2026-08-03T00:00:00Z'),
      });
      const active2 = makeItem({
        id: 4,
        name: 'active-2',
        order: 3,
        doneDate: null,
      });
      // Repository returns a deliberately shuffled order: archived items first.
      mockRepo.findByNoteIdWithUserValidation.mockResolvedValue([
        archived1,
        active1,
        archived2,
        active2,
      ]);

      const result = await target.findByNoteId(noteId, userId);

      expect(mockRepo.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        noteId,
        userId
      );
      expect(result.map(p => p.id)).toEqual([2, 4, 1, 3]);
    });

    it('pins quirk: an item whose doneDate is undefined (never set) is emitted twice, once per group', async () => {
      // Source asymmetry in check-items.aggregator.ts: the non-archived
      // filter uses `doneDate == null` (loose, catches null AND undefined)
      // while the archived filter uses `doneDate !== null` (strict, so
      // undefined is also treated as archived). DB-hydrated items always
      // carry null or a Date, so only in-memory entities with an unset
      // doneDate are affected. Pinned as written, not fixed.
      const set = makeItem({
        id: 1,
        name: 'set',
        order: 0,
        doneDate: new Date('2026-08-01T00:00:00Z'),
      });
      const unset = makeItem({ id: 2, name: 'unset', order: 1 });
      mockRepo.findByNoteIdWithUserValidation.mockResolvedValue([set, unset]);

      const result = await target.findByNoteId(noteId, userId);

      expect(result.map(p => p.id)).toEqual([2, 1, 2]);
    });

    it('projects each item onto the CheckItemProjection shape', async () => {
      const createdAt = new Date('2026-07-01T00:00:00Z');
      const updatedAt = new Date('2026-07-02T00:00:00Z');
      const doneDate = new Date('2026-07-03T00:00:00Z');
      const archiveDate = new Date('2026-07-04T00:00:00Z');
      const item = makeItem({
        id: 7,
        name: 'seven',
        status: 'done',
        order: 3,
        description: 'the description',
        doneDate,
        archiveDate,
        createdAt,
        updatedAt,
      });
      mockRepo.findByNoteIdWithUserValidation.mockResolvedValue([item]);

      const result = await target.findByNoteId(noteId, userId);

      expect(result).toEqual([
        {
          id: 7,
          name: 'seven',
          status: 'done',
          doneDate,
          archiveDate,
          noteId,
          order: 3,
          description: 'the description',
          createdAt,
          updatedAt,
        },
      ]);
    });
  });

  describe('bulkCreate', () => {
    it('rebases incoming order onto the current max order of the note', async () => {
      mockRepo.findByNoteId.mockResolvedValue([
        makeItem({ id: 1, order: 0 }),
        makeItem({ id: 2, order: 4 }),
        makeItem({ id: 3, order: 2 }),
      ]);
      mockRepo.saveMany.mockResolvedValue([]);
      const doneDate = new Date('2026-09-01T00:00:00Z');

      await target.bulkCreate(noteId, [
        {
          name: 'first',
          description: null,
          status: 'ready',
          order: 0,
          doneDate: null,
          archiveDate: null,
        },
        {
          name: 'second',
          description: 'd',
          status: 'in_progress',
          order: 0,
          doneDate,
          archiveDate: null,
        },
      ]);

      expect(mockRepo.findByNoteId).toHaveBeenCalledWith(noteId);
      expect(mockRepo.saveMany).toHaveBeenCalledTimes(1);
      const saved = mockRepo.saveMany.mock.calls[0][0];
      expect(saved.map(i => i.order)).toEqual([5, 6]);
      expect(saved[0]).toMatchObject({
        name: 'first',
        noteId,
        status: 'ready',
        doneDate: null,
        archiveDate: null,
        description: null,
      });
      expect(saved[1]).toMatchObject({
        name: 'second',
        noteId,
        status: 'in_progress',
        doneDate,
        description: 'd',
      });
    });

    it('starts order at 0 when the note has no existing items', async () => {
      mockRepo.findByNoteId.mockResolvedValue([]);
      mockRepo.saveMany.mockResolvedValue([]);

      await target.bulkCreate(noteId, [
        {
          name: 'first',
          description: null,
          status: 'ready',
          order: 0,
          doneDate: null,
          archiveDate: null,
        },
        {
          name: 'second',
          description: null,
          status: 'done',
          order: 0,
          doneDate: null,
          archiveDate: null,
        },
      ]);

      const saved = mockRepo.saveMany.mock.calls[0][0];
      expect(saved.map(i => i.order)).toEqual([0, 1]);
    });
  });
});
