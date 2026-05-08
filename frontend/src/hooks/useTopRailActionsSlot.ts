import { useContext } from 'react';
import { TopRailActionsContext } from '../contexts/top-rail-actions.context';

/**
 * Returns the current page actions registered via `useTopRailActions`.
 * Used by TopRail and Header to render the actions slot.
 */
export const useTopRailActionsSlot = (): React.ReactNode => {
  const ctx = useContext(TopRailActionsContext);
  return ctx?.actions ?? null;
};
