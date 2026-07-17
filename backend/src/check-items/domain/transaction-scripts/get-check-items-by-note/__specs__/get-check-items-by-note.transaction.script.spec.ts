import { Test } from '@nestjs/testing';
import { GetCheckItemsByNoteTransactionScript } from '../get-check-items-by-note.transaction.script';
import { CheckItemsRepository } from '../../../../infra/repositories/check-items/check-items.repository';
import { CheckItem } from '../../../entities/check-item.entity';
import { createMock } from '../../../../../shared-kernel/test-utils';

describe('GetCheckItemsByNoteTransactionScript', () => {
  let target: GetCheckItemsByNoteTransactionScript;
  let mockRepository: jest.Mocked<CheckItemsRepository>;

  const createMockItem = (overrides: Partial<CheckItem> = {}): CheckItem => ({
    id: 1,
    name: 'Test Item',
    description: null,
    doneDate: null,
    archiveDate: null,
    noteId: 1,
    order: 0,
    status: 'ready',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockRepository = createMock<CheckItemsRepository>({
      findByNoteIdWithUserValidation: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetCheckItemsByNoteTransactionScript,
        { provide: CheckItemsRepository, useValue: mockRepository },
      ],
    }).compile();

    target = moduleRef.get(GetCheckItemsByNoteTransactionScript);
  });

  describe('apply', () => {
    it('should return empty array when no items found', async () => {
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue([]);

      const result = await target.apply(1, 1);

      expect(result).toEqual([]);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        undefined
      );
    });

    it('should return all items when no filters provided', async () => {
      const items = [
        createMockItem({ id: 1, name: 'Alpha', status: 'ready' }),
        createMockItem({ id: 2, name: 'Beta', status: 'in_progress' }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1);

      expect(result).toHaveLength(2);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        undefined
      );
    });

    it('should pass query filter to repository', async () => {
      const items = [
        createMockItem({ id: 1, name: 'Buy groceries' }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1, { query: 'groceries' });

      expect(result).toHaveLength(1);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        { query: 'groceries' }
      );
    });

    it('should pass status filter to repository', async () => {
      const items = [
        createMockItem({ id: 1, name: 'Task A', status: 'ready' }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1, { status: ['ready'] });

      expect(result).toHaveLength(1);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        { status: ['ready'] }
      );
    });

    it('should pass multiple status filters to repository', async () => {
      const items = [
        createMockItem({ id: 1, name: 'Task A', status: 'ready' }),
        createMockItem({ id: 2, name: 'Task B', status: 'in_progress' }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1, {
        status: ['ready', 'in_progress'],
      });

      expect(result).toHaveLength(2);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        { status: ['ready', 'in_progress'] }
      );
    });

    it('should pass includeDone filter to repository', async () => {
      const items = [
        createMockItem({ id: 1, name: 'Active Task', doneDate: null }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1, { includeDone: false });

      expect(result).toHaveLength(1);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        { includeDone: false }
      );
    });

    it('should pass all filters combined to repository', async () => {
      const items = [
        createMockItem({
          id: 1,
          name: 'Alpha',
          status: 'ready',
          doneDate: null,
        }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1, {
        query: 'alpha',
        status: ['ready'],
        includeDone: false,
      });

      expect(result).toHaveLength(1);
      expect(mockRepository.findByNoteIdWithUserValidation).toHaveBeenCalledWith(
        1,
        1,
        { query: 'alpha', status: ['ready'], includeDone: false }
      );
    });

    it('should sort items with non-null doneDate after items with null doneDate', async () => {
      const items = [
        createMockItem({
          id: 2,
          name: 'Done Task',
          doneDate: new Date(),
        }),
        createMockItem({ id: 1, name: 'Active Task', doneDate: null }),
      ];
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue(items);

      const result = await target.apply(1, 1);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Active Task');
      expect(result[1].name).toBe('Done Task');
    });

    it('should return empty array when no matches', async () => {
      mockRepository.findByNoteIdWithUserValidation.mockResolvedValue([]);

      const result = await target.apply(1, 1, { query: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });
});
