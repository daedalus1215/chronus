import React, { useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { Input } from '@/components/ui/input';
import { TimeTrackAggregationResponse } from '../../../../api/dtos/time-tracks.dtos';
import styles from './DailyTimeTracksRadar.module.css';
import { getCurrentDateString } from '../../../../utils/dateUtils';
import { useDailyTimeTracksAggregation } from '../../hooks/useDailyTimeTracksAggregation';

type Props = {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  data?: TimeTrackAggregationResponse[];
  loading?: boolean;
  showControls?: boolean;
};

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const RadarTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{point.payload.metric}</div>
      <div className={styles.tooltipValue}>{formatMinutes(point.value ?? 0)}</div>
    </div>
  );
};

export const DailyTimeTracksRadar: React.FC<Props> = ({
  selectedDate: externalSelectedDate,
  onDateChange,
  data: externalData,
  loading: externalLoading,
  showControls = false,
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(
    () => {
      return getCurrentDateString();
    }
  );

  const selectedDate = externalSelectedDate || internalSelectedDate;
  const shouldFetch = !externalData;

  const {
    data: internalData,
    isLoading: internalLoading,
    error: internalError,
  } = useDailyTimeTracksAggregation(selectedDate, shouldFetch);

  const timeTracks = externalData || internalData;
  const loading = externalLoading || internalLoading;
  const error = internalError;

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      setInternalSelectedDate(newDate);
    }
  };

  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!timeTracks.length) return { chartData: [], maxValue: 0 };

    // Take top 6 notes by daily time for better visualization
    const topNotes = [...timeTracks]
      .filter(note => note.dailyTimeMinutes > 0) // Only show notes with actual daily time
      .sort((a, b) => b.dailyTimeMinutes - a.dailyTimeMinutes)
      .slice(0, 6);

    if (topNotes.length === 0) return { chartData: [], maxValue: 0 };

    const dailyTimeData = topNotes.map(note => note.dailyTimeMinutes);
    const maxDailyTime = Math.max(...dailyTimeData);

    const chartData = topNotes.map(note => ({
      metric:
        note.noteName.length > 12
          ? note.noteName.substring(0, 12) + '...'
          : note.noteName,
      value: note.dailyTimeMinutes,
    }));

    return { chartData, maxValue: Math.ceil(maxDailyTime / 10) * 10 }; // Round up to nearest 10
  };

  const { chartData, maxValue } = prepareRadarData();

  const shouldShowControls =
    showControls || (!externalSelectedDate && !onDateChange);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {shouldShowControls && (
          <div className={styles.dateControls}>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="h-9 min-w-[150px]"
            />
          </div>
        )}
      </div>

      {error ? (
        <div className={styles.error}>
          <span className="text-destructive">{error}</span>
        </div>
      ) : loading ? (
        <div className={styles.loading}>Loading time tracks...</div>
      ) : chartData.length === 0 ? (
        <div className={styles.noData}>
          <span className="text-muted-foreground">
            No time tracks found for this date
          </span>
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="var(--color-border-light)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <PolarRadiusAxis
                domain={[0, maxValue || 60]}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                tickFormatter={formatMinutes}
              />
              <Tooltip content={<RadarTooltip />} />
              <Radar
                name="Daily Time"
                dataKey="value"
                stroke="var(--accent-2)"
                fill="var(--accent-2)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
