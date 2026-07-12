import React, { useState, useCallback } from 'react';
import { TopRailActionsContext } from './top-rail-actions.context';

export const TopRailActionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [actions, setActionsState] = useState<React.ReactNode>(null);

  const setActions = useCallback((node: React.ReactNode) => {
    setActionsState(node);
  }, []);

  return (
    <TopRailActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </TopRailActionsContext.Provider>
  );
};
