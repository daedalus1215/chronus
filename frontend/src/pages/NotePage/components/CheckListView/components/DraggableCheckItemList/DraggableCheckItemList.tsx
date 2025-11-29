import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CheckItem } from '../../../../api/responses';

type DraggableCheckItemListProps = {
  checkItems: CheckItem[];
  onReorder: (checkItemIds: number[]) => void;
  renderItem: (item: CheckItem, index: number) => React.ReactNode;
};

export const DraggableCheckItemList: React.FC<DraggableCheckItemListProps> = ({
  checkItems,
  onReorder,
  renderItem,
}) => {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = checkItems.findIndex(item => item.id === active.id);
      const newIndex = checkItems.findIndex(item => item.id === over.id);

      const reorderedItems = arrayMove(checkItems, oldIndex, newIndex);
      const reorderedIds = reorderedItems.map(item => item.id);
      onReorder(reorderedIds);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={checkItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {checkItems.map((item, index) => renderItem(item, index))}
      </SortableContext>
    </DndContext>
  );
};
