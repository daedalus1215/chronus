import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { TimeTrackWithNoteResponse } from '../../../../api/dtos/time-tracks.dtos';
import styles from './ActivityScatterChart.module.css';

type Props = {
  tracks: TimeTrackWithNoteResponse[];
  from: string;
  to: string;
  loading: boolean;
};

const WIDTH = 920;
const HEIGHT = 420;
const MARGIN = { top: 16, right: 20, bottom: 44, left: 64 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const DAY_MINUTES = 24 * 60;

/* Categorical palette for per-note colors (same hue family as the rest of the app) */
const NOTE_COLORS = [
  '#6366f1',
  '#22d3ee',
  '#f59e0b',
  '#ec4899',
  '#22c55e',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
  '#eab308',
  '#f97316',
  '#818cf8',
  '#64748b',
];

const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 74;

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toTimeString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const startOfMinutes = (hms: string): number => {
  const [hours, minutes] = hms.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatClock = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours === 0 ? `${mins}m` : `${hours}h ${mins}m`;
};

const daysInRange = (from: string, to: string): string[] => {
  const out: string[] = [];
  const current = parseDate(from);
  const end = parseDate(to);
  // Safety cap: rendering beyond a year of day-rows is degenerate
  while (current.getTime() <= end.getTime() && out.length < 366) {
    out.push(toTimeString(current));
    current.setDate(current.getDate() + 1);
  }
  return out;
};

/* Marker radius: sqrt scale so area tracks duration; 1h ≈ 7px, 8h ≈ 16px (clamped) */
const markerRadius = (minutes: number): number =>
  Math.min(16, Math.max(3.5, 3.5 + Math.sqrt(minutes) * 0.45));

export const ActivityScatterChart: React.FC<Props> = ({
  tracks,
  from,
  to,
  loading,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const days = useMemo(
    () => (from && to && from <= to ? daysInRange(from, to) : []),
    [from, to],
  );

  const dayIndex = useMemo(() => {
    const index: Record<string, number> = {};
    days.forEach((day, i) => {
      index[day] = i;
    });
    return index;
  }, [days]);

  /* Notes ordered by total minutes (most active first) for stable color assignment */
  const noteTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const track of tracks) {
      totals[track.noteName] =
        (totals[track.noteName] ?? 0) + track.durationMinutes;
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [tracks]);

  const noteColor = useMemo(() => {
    const colors: Record<string, string> = {};
    noteTotals.forEach(([name], i) => {
      colors[name] = NOTE_COLORS[i % NOTE_COLORS.length];
    });
    return colors;
  }, [noteTotals]);

  const totalMinutes = useMemo(
    () => tracks.reduce((sum, track) => sum + track.durationMinutes, 0),
    [tracks],
  );

  if (loading) {
    return (
      <Paper className={styles.container}>
        <Typography variant="h6">Activity</Typography>
        <Box className={styles.loading}>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  const xScale = (minutes: number) =>
    MARGIN.left + (minutes / DAY_MINUTES) * INNER_W;
  const bandHeight = INNER_H / days.length;
  const yScale = (date: string) =>
    MARGIN.top + ((dayIndex[date] ?? 0) + 0.5) * bandHeight;

  const points = tracks
    .filter(track => dayIndex[track.date] !== undefined)
    .map(track => ({
      track,
      cx: xScale(startOfMinutes(track.startTime)),
      cy: yScale(track.date),
      radius: markerRadius(track.durationMinutes),
      color: noteColor[track.noteName] ?? NOTE_COLORS[NOTE_COLORS.length - 1],
    }));

  const xTicks = Array.from({ length: 9 }, (_, i) => i * 3 * 60);
  const yLabelStep = Math.ceil(days.length / 14);
  const showDayLines = days.length <= 60;

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <Paper className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6">Activity</Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {tracks.length} session{tracks.length === 1 ? '' : 's'} ·{' '}
          {formatDuration(totalMinutes)} total
        </Typography>
      </div>

      {noteTotals.length > 0 && (
        <div className={styles.legend}>
          {noteTotals.map(([name]) => (
            <span key={name} className={styles.legendItem} title={name}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: noteColor[name] }}
              />
              {name}
            </span>
          ))}
        </div>
      )}

      <Box
        className={styles.chartContainer}
        sx={{ color: 'text.secondary' }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={styles.chart}
          role="img"
          aria-label="Scatter plot of time-tracked sessions by date and time of day"
        >
          {/* Day separators */}
          {showDayLines &&
            days.map((day, index) => (
              <line
                key={`day-${day}`}
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={MARGIN.top + index * bandHeight}
                y2={MARGIN.top + index * bandHeight}
                className={styles.gridLine}
              />
            ))}
          {showDayLines && (
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={MARGIN.top + days.length * bandHeight}
              y2={MARGIN.top + days.length * bandHeight}
              className={styles.gridLine}
            />
          )}

          {/* X gridlines + tick labels (time of day) */}
          {xTicks.map(minutes => (
            <g key={`x-${minutes}`}>
              <line
                x1={xScale(minutes)}
                x2={xScale(minutes)}
                y1={MARGIN.top}
                y2={HEIGHT - MARGIN.bottom}
                className={styles.gridLine}
              />
              <text
                x={xScale(minutes)}
                y={HEIGHT - MARGIN.bottom + 20}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {formatClock(minutes)}
              </text>
            </g>
          ))}
          <text
            x={MARGIN.left + INNER_W / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            className={styles.axisTitle}
          >
            Time of day
          </text>

          {/* Y tick labels (days) */}
          {days.map((day, index) =>
            index % yLabelStep === 0 ? (
              <text
                key={`y-${day}`}
                x={MARGIN.left - 10}
                y={MARGIN.top + (index + 0.5) * bandHeight}
                textAnchor="end"
                dominantBaseline="middle"
                className={styles.axisLabel}
              >
                {parseDate(day).toLocaleDateString('en-US', {
                  weekday: 'short',
                })}{' '}
                {parseDate(day).getDate()}
              </text>
            ) : null,
          )}

          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={point.track.id}
              cx={point.cx}
              cy={point.cy}
              r={point.radius}
              fill={point.color}
              fillOpacity={hoveredIndex === null || hoveredIndex === index ? 0.85 : 0.45}
              stroke={hoveredIndex === index ? 'currentColor' : 'none'}
              strokeWidth={hoveredIndex === index ? 1.5 : 0}
              className={styles.point}
              onMouseEnter={() => setHoveredIndex(index)}
            />
          ))}

          {/* Tooltip */}
          {hovered && (
            <foreignObject
              x={
                hovered.cx + TOOLTIP_WIDTH / 2 > WIDTH - MARGIN.right
                  ? hovered.cx - TOOLTIP_WIDTH - 10
                  : hovered.cx + 10
              }
              y={
                hovered.cy - hovered.radius - TOOLTIP_HEIGHT - 8 < 0
                  ? hovered.cy + hovered.radius + 8
                  : hovered.cy - hovered.radius - TOOLTIP_HEIGHT - 8
              }
              width={TOOLTIP_WIDTH}
              height={TOOLTIP_HEIGHT}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <div className={styles.tooltip}>
                <div className={styles.tooltipTitle}>
                  {hovered.track.noteName}
                </div>
                <div>
                  {parseDate(hovered.track.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {hovered.track.startTime.slice(0, 5)}
                </div>
                <div>{formatDuration(hovered.track.durationMinutes)} tracked</div>
              </div>
            </foreignObject>
          )}
        </svg>
      </Box>
    </Paper>
  );
};
