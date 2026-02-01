import React from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import { NOTE_PREFIX } from './tagTreeItems';

/** Font size for nested note items (tags use default tree font). Adjust as needed. */
const NESTED_NOTE_FONT_SIZE = '0.8125rem';

/** Nested note label color from app palette – stands out from tag labels. */
const NESTED_NOTE_LABEL_COLOR = 'var(--color-text-secondary)';

const NOTE_LABEL_SX = {
  fontSize: NESTED_NOTE_FONT_SIZE,
  color: NESTED_NOTE_LABEL_COLOR,
};
const ICON_CONTAINER_SX = {
  fontSize: 20,
  color: 'var(--color-text-secondary)',
  '& svg': { fontSize: 20 },
};
/** Subtle divider under each row so items read as distinct. */
const CONTENT_DIVIDER_SX = {
  borderBottom: '1px solid var(--color-border-light)',
};

/**
 * Custom TreeItem that applies slotProps for nested item styling:
 * - Note items (id starting with "note-"): smaller label font and secondary color.
 * - All items: icon container size/color, and a bottom border divider per row.
 */
export const CustomTagTreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  (props, ref) => {
    const { itemId, slotProps = {}, ...rest } = props;
    const isNote = typeof itemId === 'string' && itemId.startsWith(NOTE_PREFIX);
    const contentSlot = slotProps.content as { sx?: object } | undefined;
    const labelSlot = slotProps.label as { sx?: object } | undefined;
    const iconSlot = slotProps.iconContainer as { sx?: object } | undefined;
    const mergedSlotProps = {
      ...slotProps,
      content: {
        ...slotProps.content,
        sx: { ...CONTENT_DIVIDER_SX, ...contentSlot?.sx },
      },
      label: isNote
        ? { ...slotProps.label, sx: { ...NOTE_LABEL_SX, ...labelSlot?.sx } }
        : slotProps.label,
      iconContainer: {
        ...slotProps.iconContainer,
        sx: { ...ICON_CONTAINER_SX, ...iconSlot?.sx },
      },
    };
    return <TreeItem ref={ref} {...rest} itemId={itemId} slotProps={mergedSlotProps} />;
  }
);

CustomTagTreeItem.displayName = 'CustomTagTreeItem';
