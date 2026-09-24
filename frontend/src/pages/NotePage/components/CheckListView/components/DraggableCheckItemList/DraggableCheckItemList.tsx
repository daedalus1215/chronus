import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CheckItem } from '../../../../api/responses';
import { useFlipList } from '../../hooks/useFlipList';

type DraggableCheckItemListProps = {
  checkItems: CheckItem[];
  onReorder: (checkItemIds: number[]) => void;
  renderItem: (
    item: CheckItem,
    index: number,
    registerFlipNode: (id: number, node: HTMLElement | null) => void
  ) => React.ReactNode;
};

export const DraggableCheckItemList: React.FC<DraggableCheckItemListProps> = ({
  checkItems,
  onReorder,
  renderItem,
}) => {
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [settledDragId, setSettledDragId] = useState<number | null>(null);
  const registerFlipNode = useFlipList(
    checkItems.map(item => item.id),
    activeDragId,
    settledDragId
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(Number(event.active.id));
    setSettledDragId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = checkItems.findIndex(item => item.id === active.id);
      const newIndex = checkItems.findIndex(item => item.id === over.id);

      const reorderedItems = arrayMove(checkItems, oldIndex, newIndex);
      const reorderedIds = reorderedItems.map(item => item.id);
      // dnd-kit settles the dropped row itself; FLIP animates the rest.
      setSettledDragId(Number(active.id));
      onReorder(reorderedIds);
    }
  };

  // Release the settled row one frame after the drop settle so it can
  // participate in later FLIP animations.
  useEffect(() => {
    if (settledDragId === null) return;
    const frame = requestAnimationFrame(() => setSettledDragId(null));
    return () => cancelAnimationFrame(frame);
  }, [settledDragId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={checkItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {checkItems.map((item, index) =>
          renderItem(item, index, registerFlipNode)
        )}
      </SortableContext>
    </DndContext>
  );
};
