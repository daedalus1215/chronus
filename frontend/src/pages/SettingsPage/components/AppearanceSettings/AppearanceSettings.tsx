import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useThemeMode } from '../../../../contexts/ThemeModeContext';
import type { ThemeMode } from '../../../../contexts/ThemeModeContext';

const THEME_MODES: readonly {
  readonly value: ThemeMode;
  readonly label: string;
  readonly icon: React.ReactElement;
}[] = [
  { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="size-4" /> },
];

export const AppearanceSettings: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  const handleModeChange = (next: string) => {
    if (next) {
      setMode(next as ThemeMode);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Appearance</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose how Chronus looks. "System" follows your device&apos;s light or
          dark preference.
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={handleModeChange}
          aria-label="Theme mode"
          className="max-w-[420px]"
        >
          {THEME_MODES.map(({ value, label, icon }) => (
            <ToggleGroupItem key={value} value={value} aria-label={label}>
              {icon}
              <span className="ml-1.5 text-sm">{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
};
