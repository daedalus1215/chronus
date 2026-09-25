import React from 'react';
import {
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ComputerIcon from '@mui/icons-material/Computer';
import { useThemeMode } from '../../../../contexts/ThemeModeContext';
import type { ThemeMode } from '../../../../contexts/ThemeModeContext';

const THEME_MODES: readonly {
  readonly value: ThemeMode;
  readonly label: string;
  readonly icon: React.ReactElement;
}[] = [
  { value: 'light', label: 'Light', icon: <LightModeIcon /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeIcon /> },
  { value: 'system', label: 'System', icon: <ComputerIcon /> },
];

export const AppearanceSettings: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    next: ThemeMode | false
  ) => {
    if (next !== false) {
      setMode(next);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose how Chronus looks. "System" follows your device&apos;s light or
        dark preference.
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        aria-label="Theme mode"
        sx={{ maxWidth: 420, display: 'inline-flex' }}
      >
        {THEME_MODES.map(({ value, label, icon }) => (
          <ToggleButton key={value} value={value} aria-label={label}>
            {icon}
            <Typography variant="body2" sx={{ ml: 0.75 }}>
              {label}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};
