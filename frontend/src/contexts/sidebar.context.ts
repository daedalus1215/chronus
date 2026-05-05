import { createContext } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  isNoteListOpen: boolean;
  setIsNoteListOpen: (open: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);
