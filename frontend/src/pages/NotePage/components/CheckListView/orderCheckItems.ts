import { CheckItem } from '../../api/responses';

/**
 * Display order for a note's check items: unchecked items first
 * (in manual order), then checked items most recently completed first.
 *
 * Mirrors the backend ordering contract so locally-updated caches always
 * agree with what the server returns.
 */
export const orderCheckItemsForDisplay = (
  checkItems: CheckItem[]
): CheckItem[] => {
  const uncheckedItems = checkItems
    .filter(item => item.doneDate == null)
    .sort((a, b) => a.order - b.order || a.id - b.id);

  const checkedItems = checkItems
    .filter(item => item.doneDate != null)
    .sort(
      (a, b) =>
        new Date(b.doneDate as string).getTime() -
          new Date(a.doneDate as string).getTime() || b.id - a.id
    );

  return [...uncheckedItems, ...checkedItems];
};
