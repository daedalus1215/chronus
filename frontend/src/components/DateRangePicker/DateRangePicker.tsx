import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './DateRangePicker.module.css';

const PRESETS = [
  { label: 'Today', days: 1 },
  { label: '3d', days: 3 },
  { label: '5d', days: 5 },
  { label: '7d', days: 7 },
];

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

function getToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

type Props = {
  from: string;
  to: string;
  onPreset: (days: number) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export const DateRangePicker: React.FC<Props> = ({
  from,
  to,
  onPreset,
  onFromChange,
  onToChange,
}) => {
  const activePreset = useMemo(() => {
    for (const p of PRESETS) {
      if (from === getDaysAgo(p.days - 1) && to === getToday()) {
        return p.days;
      }
    }
    return null;
  }, [from, to]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <CalendarDays className={styles.icon} />
        <span className={styles.title}>Date Range</span>
      </div>

      <div className={styles.content}>
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <Button
              key={p.days}
              size="sm"
              variant={activePreset === p.days ? 'default' : 'outline'}
              onClick={() => onPreset(p.days)}
              className={cn(
                styles.presetButton,
                activePreset === p.days && styles.presetButtonActive
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.customRange}>
          <div className={styles.dateField}>
            <Label htmlFor="date-range-from" className="mb-1 block text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="date-range-from"
              type="date"
              value={from}
              onChange={e => onFromChange(e.target.value)}
              className="h-8"
            />
          </div>
          <span className={styles.rangeSeparator}>to</span>
          <div className={styles.dateField}>
            <Label htmlFor="date-range-to" className="mb-1 block text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="date-range-to"
              type="date"
              value={to}
              onChange={e => onToChange(e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
