import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APPEARANCE.THEME_MODE);
    if (isThemeMode(stored)) return stored;
  } catch {
    // localStorage unavailable (private mode, blocked); fall through.
  }
  return 'system';
};

type ThemeModeContextValue = {
  /** The user's selection: explicit mode or 'system'. */
  readonly mode: ThemeMode;
  /** The mode actually applied after resolving 'system'. */
  readonly effectiveMode: 'light' | 'dark';
  readonly setMode: (mode: ThemeMode) => void;
  /**
   * Switches to the opposite of the currently effective mode. In 'system'
   * mode this pins an explicit choice.
   */
  readonly toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia(SYSTEM_DARK_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const effectiveMode: 'light' | 'dark' = useMemo(
    () => (mode === 'system' ? (systemDark ? 'dark' : 'light') : mode),
    [mode, systemDark]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveMode;
  }, [effectiveMode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEYS.APPEARANCE.THEME_MODE, next);
    } catch {
      // Persistence unavailable; the in-session choice still applies.
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(effectiveMode === 'dark' ? 'light' : 'dark');
  }, [effectiveMode, setMode]);

  const value = useMemo(
    () => ({ mode, effectiveMode, setMode, toggle }),
    [mode, effectiveMode, setMode, toggle]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
