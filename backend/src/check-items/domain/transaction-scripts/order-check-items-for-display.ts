import { CheckItem } from '../entities/check-item.entity';

/**
 * Display order for a note's check items:
 *
 * - unchecked items first, in their manual (drag) position,
 * - then checked items, most recently completed first.
 *
 * Plain function (not an injectable) so transaction scripts can share the
 * contract without same-level injection.
 */
export const orderCheckItemsForDisplay = (
  checkItems: CheckItem[]
): CheckItem[] => {
  const uncheckedCheckItems = checkItems
    .filter(item => item.doneDate == null)
    .sort((a, b) => a.order - b.order || a.id - b.id);

  const checkedCheckItems = checkItems
    .filter(item => item.doneDate != null)
    .sort(
      (a, b) =>
        new Date(b.doneDate as Date).getTime() -
          new Date(a.doneDate as Date).getTime() || b.id - a.id
    );

  return [...uncheckedCheckItems, ...checkedCheckItems];
};
