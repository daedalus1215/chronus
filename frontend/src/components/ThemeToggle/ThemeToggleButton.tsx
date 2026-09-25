import React from 'react';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
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
    <IconButton
      onClick={toggle}
      aria-label={label}
      title={label}
      size="small"
      sx={{ color: 'text.secondary' }}
    >
      {toLight ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
    </IconButton>
  );
};
