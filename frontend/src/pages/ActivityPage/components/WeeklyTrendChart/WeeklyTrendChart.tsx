import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { WeeklyTrendResponseDto } from '../../../../api/dtos/weekly-trend.dtos';
import styles from './WeeklyTrendChart.module.css';

type Props = {
  data: WeeklyTrendResponseDto | null;
  loading: boolean;
};

const formatDayLabel = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

const ChartTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const minutes = payload[0].value ?? 0;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipValue}>{formatTime(minutes)}</span>
    </div>
  );
};

export const WeeklyTrendChart: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Weekly Trend</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const hasActivity = !!data && data.trend.length > 0 && data.weeklyTotal > 0;

  if (!hasActivity) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Weekly Trend</h2>
        <div className={styles.noData}>
          <span className="text-muted-foreground">No activity in the last 7 days</span>
        </div>
      </div>
    );
  }

  const chartData = data.trend.map(day => ({
    label: formatDayLabel(day.date),
    minutes: day.totalMinutes,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Weekly Trend</h2>
        <span className="text-sm text-muted-foreground">
          Total: {formatTime(data.weeklyTotal)}
        </span>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={formatTime}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'var(--color-overlay-light)' }}
            />
            <Bar
              dataKey="minutes"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              name="Minutes"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
