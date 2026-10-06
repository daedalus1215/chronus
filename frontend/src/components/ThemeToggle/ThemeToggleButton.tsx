import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '../../contexts/ThemeModeContext';

/**
 * Quick theme switcher for the app header. Shows the icon of the mode it
 * will switch TO (sun while dark, moon while light). Switching always pins
 * an explicit mode, even when the user is currently in 'system' mode.
 */
export const ThemeToggleButton: React.FC = () => {
  const { effectiveMode, toggle } = useThemeMode();
  const toLight = effectiveMode === 'dark';
  const label = toLight ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Button
      onClick={toggle}
      aria-label={label}
      title={label}
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground"
    >
      {toLight ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
};
