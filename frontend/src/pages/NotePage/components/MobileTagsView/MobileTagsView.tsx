import React from 'react';
import { BottomSheet } from '@components/BottomSheet/BottomSheet';
import { SidebarTagsView } from '../SidebarTagsView/SidebarTagsView';

type MobileTagsViewProps = {
  noteId: number;
  isOpen: boolean;
  onClose: () => void;
};

export const MobileTagsView: React.FC<MobileTagsViewProps> = ({
  noteId,
  isOpen,
  onClose,
}) => (
  <BottomSheet isOpen={isOpen} onClose={onClose}>
    <SidebarTagsView noteId={noteId} />
  </BottomSheet>
);
