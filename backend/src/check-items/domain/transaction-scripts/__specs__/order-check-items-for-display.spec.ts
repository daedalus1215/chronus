import { CheckItem } from '../../entities/check-item.entity';
import { orderCheckItemsForDisplay } from '../order-check-items-for-display';

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

describe('given: orderCheckItemsForDisplay', () => {
  let target: typeof orderCheckItemsForDisplay;

  beforeEach(() => {
    target = orderCheckItemsForDisplay;
  });

  describe('when: ordering check items for display', () => {
    test('then: unchecked items come first in their manual order', () => {
      // Arrange
      const items = [
        createCheckItem({ id: 3, order: 2 }),
        createCheckItem({ id: 1, order: 0 }),
        createCheckItem({ id: 2, order: 1 }),
      ];

      // Act
      const result = target(items);

      // Assert
      expect(result.map(item => item.id)).toEqual([1, 2, 3]);
    });

    test('then: checked items come after unchecked, most recently completed first', () => {
      // Arrange
      const items = [
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
        createCheckItem({
          id: 4,
          order: 3,
          doneDate: new Date('2026-01-01T00:00:00Z'),
        }),
      ];

      // Act
      const result = target(items);

      // Assert
      expect(result.map(item => item.id)).toEqual([2, 3, 1, 4]);
    });

    test('then: all-checked items are ordered most recently completed first', () => {
      // Arrange
      const items = [
        createCheckItem({
          id: 1,
          order: 0,
          doneDate: new Date('2026-01-01T00:00:00Z'),
        }),
        createCheckItem({
          id: 2,
          order: 1,
          doneDate: new Date('2026-01-02T00:00:00Z'),
        }),
      ];

      // Act
      const result = target(items);

      // Assert
      expect(result.map(item => item.id)).toEqual([2, 1]);
    });

    test('then: checked items with the same done date fall back to id descending', () => {
      // Arrange
      const doneDate = new Date('2026-01-01T00:00:00Z');
      const items = [
        createCheckItem({ id: 5, order: 0, doneDate }),
        createCheckItem({ id: 9, order: 1, doneDate }),
        createCheckItem({ id: 2, order: 2, doneDate }),
      ];

      // Act
      const result = target(items);

      // Assert
      expect(result.map(item => item.id)).toEqual([9, 5, 2]);
    });

    test('then: an empty list returns an empty list', () => {
      // Act
      const result = target([]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
