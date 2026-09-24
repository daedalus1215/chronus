import { useCallback, useLayoutEffect, useRef } from 'react';

const FLIP_DURATION_MS = 220;
const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
const MIN_MOVE_PX = 1;

/**
 * Animates position changes of rows in a list (FLIP: First-Last-Invert-Play).
 *
 * When the list re-renders its rows in a new DOM order (for example after a
 * check item is completed and the list settles into its canonical order),
 * rows slide from their previous position to the new one instead of jumping.
 *
 * Returns a ref-registration callback that each row attaches to its root node.
 */
export const useFlipList = (
  itemIds: number[],
  activeDragId: number | null,
  settledDragId: number | null
): ((id: number, node: HTMLElement | null) => void) => {
  const nodesRef = useRef(new Map<number, HTMLElement>());
  const previousRectsRef = useRef(new Map<number, DOMRect>());
  const previousKeyRef = useRef<string | null>(null);

  const registerNode = useCallback((id: number, node: HTMLElement | null) => {
    if (node) {
      nodesRef.current.set(id, node);
    } else {
      nodesRef.current.delete(id);
      previousRectsRef.current.delete(id);
    }
  }, []);

  useLayoutEffect(() => {
    const currentKey = itemIds.join(',');
    const orderChanged =
      previousKeyRef.current !== null && previousKeyRef.current !== currentKey;
    // Skip while dnd-kit owns the transforms, and skip the row that was
    // just dropped (dnd-kit settles that row itself).
    const shouldAnimate = orderChanged && activeDragId === null;

    nodesRef.current.forEach((node, id) => {
      const previous = previousRectsRef.current.get(id);
      const current = node.getBoundingClientRect();
      if (shouldAnimate && previous && id !== settledDragId) {
        const deltaX = previous.left - current.left;
        const deltaY = previous.top - current.top;
        if (
          Math.abs(deltaX) >= MIN_MOVE_PX ||
          Math.abs(deltaY) >= MIN_MOVE_PX
        ) {
          node.animate(
            [
              { transform: `translate(${deltaX}px, ${deltaY}px)` },
              { transform: 'translate(0px, 0px)' },
            ],
            { duration: FLIP_DURATION_MS, easing: FLIP_EASING }
          );
        }
      }
      previousRectsRef.current.set(id, current);
    });

    previousKeyRef.current = currentKey;
  });

  return registerNode;
};
