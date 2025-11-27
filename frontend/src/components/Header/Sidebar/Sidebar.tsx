import React from 'react';
import { useSidebar } from '../../../hooks/useSidebar';
import { MobileSidebar } from './MobileSidebar';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isMobile } = useSidebar();
  
  if (isMobile) {
    return <MobileSidebar isOpen={isOpen} onClose={onClose} />;
  }
  // Desktop sidebar is rendered inside page layouts (e.g., HomePage) to
  // participate in the same flex row as the content.
  return null;
}; 