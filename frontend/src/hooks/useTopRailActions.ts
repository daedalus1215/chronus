import { useContext, useEffect } from 'react';
import { TopRailActionsContext } from '../contexts/top-rail-actions.context';

/**
 * Projects a ReactNode into the TopRail (desktop) / Header (mobile) actions slot.
 * The node is registered on mount and cleared on unmount.
 *
 * Callers should `useMemo` the actions node to avoid unnecessary re-renders.
 */
export const useTopRailActions = (actions: React.ReactNode): void => {
  const ctx = useContext(TopRailActionsContext);

  if (!ctx) {
    throw new Error(
      'useTopRailActions must be used within a TopRailActionsProvider',
    );
  }

  const { setActions } = ctx;

  useEffect(() => {
    setActions(actions);
    return () => setActions(null);
  }, [actions, setActions]);
};
