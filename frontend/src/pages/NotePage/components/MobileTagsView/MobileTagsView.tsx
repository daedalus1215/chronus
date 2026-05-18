import React from 'react';
import { RightSheet } from '@components/RightSheet/RightSheet';
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
  <RightSheet isOpen={isOpen} onClose={onClose}>
    <SidebarTagsView noteId={noteId} />
  </RightSheet>
);
