import { createContext } from 'react';

type TopRailActionsContextType = {
  actions: React.ReactNode;
  setActions: (node: React.ReactNode) => void;
};

export const TopRailActionsContext = createContext<
  TopRailActionsContextType | undefined
>(undefined);
