import React, { useState, useEffect, useMemo } from 'react';
import { DailyTimeTracksDataGrid } from './components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid';
import { DailyTimeTracksRadar } from './components/DailyTimeTracksRadar/DailyTimeTracksRadar';
import { WeeklyTrendChart } from './components/WeeklyTrendChart/WeeklyTrendChart';
import { ActivityScatterChart } from './components/ActivityScatterChart/ActivityScatterChart';
import { DateRangePicker } from '../../components/DateRangePicker/DateRangePicker';
import { useTimeTrackDateRange } from '../../hooks/useTimeTrackDateRange';
import {
  getDailyTimeTracksAggregation,
  getWeeklyMostActiveNote,
  getWeeklyTrend,
  getStreak,
  getTimeTracksByDateRange,
} from '../../api/requests/time-tracks.requests';
import {
  TimeTrackAggregationResponse,
  TimeTrackWithNoteResponse,
} from '../../api/dtos/time-tracks.dtos';
import { WeeklyTrendResponseDto } from '../../api/dtos/weekly-trend.dtos';
import { StreakResponseDto } from '../../api/dtos/streak.dtos';
import styles from './ActivityPage.module.css';
import { WeeklyMostActiveNoteResponseDto } from '../../api/dtos/weekly-most-active-note.dtos';
import { getCurrentDateString } from '../../utils/dateUtils';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

/* ── Hand-rolled arc gauge (replaces @mui/x-charts/Gauge) ──
   A 220° arc (-110°..110°, 0° = top), matching MUI Gauge's default
   geometry. Value-arc color is a status color (good/warning/critical),
   not a categorical one, so the dataviz skill's CVD-separation check
   doesn't apply here. */
const GAUGE_START_ANGLE = -110;
const GAUGE_END_ANGLE = 110;

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const FocusGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  const valueAngle =
    GAUGE_START_ANGLE + (percentage / 100) * (GAUGE_END_ANGLE - GAUGE_START_ANGLE);
  const color =
    percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={100} height={80} viewBox="0 0 100 80" role="img" aria-label={`Focus score ${percentage}%`}>
      <path
        d={describeArc(50, 56, 36, GAUGE_START_ANGLE, GAUGE_END_ANGLE)}
        fill="none"
        stroke="var(--color-overlay-strong)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {percentage > 0 && (
        <path
          d={describeArc(50, 56, 36, GAUGE_START_ANGLE, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
        />
      )}
      <text
        x={50}
        y={56}
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.gaugeText}
      >
        {percentage}%
      </text>
    </svg>
  );
};

export const ActivityPage: React.FC = () => {
  const [timeTracks, setTimeTracks] = useState<TimeTrackAggregationResponse[]>(
    []
  );
  const [mostActiveNote, setMostActiveNote] =
    useState<WeeklyMostActiveNoteResponseDto | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendResponseDto | null>(
    null
  );
  const [streak, setStreak] = useState<StreakResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyTrendLoading, setWeeklyTrendLoading] = useState(false);
  const [streakLoading, setStreakLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getCurrentDateString();
  });

  const fetchTimeTracks = async (date?: string) => {
    setLoading(true);
    try {
      const data = await getDailyTimeTracksAggregation(date);
      setTimeTracks(data);
    } catch (err) {
      console.error('Error fetching time tracks:', err);
      setTimeTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMostActiveNote = async (date?: string) => {
    try {
      const data = await getWeeklyMostActiveNote(date);
      setMostActiveNote(data);
    } catch (err) {
      console.error('Error fetching most active note:', err);
      setMostActiveNote(null);
    }
  };

  const fetchWeeklyTrend = async (date?: string) => {
    setWeeklyTrendLoading(true);
    try {
      const data = await getWeeklyTrend(date);
      setWeeklyTrend(data);
    } catch (err) {
      console.error('Error fetching weekly trend:', err);
      setWeeklyTrend(null);
    } finally {
      setWeeklyTrendLoading(false);
    }
  };

  const fetchStreak = async (date?: string) => {
    setStreakLoading(true);
    try {
      const data = await getStreak(date);
      setStreak(data);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setStreak(null);
    } finally {
      setStreakLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeTracks(selectedDate);
    fetchMostActiveNote(selectedDate);
    fetchWeeklyTrend(selectedDate);
    fetchStreak(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  /* ── Activity scatter (independent date range, defaults to last 7 days) ── */
  const {
    from: scatterFrom,
    to: scatterTo,
    setPreset: setScatterPreset,
    setFrom: setScatterFrom,
    setTo: setScatterTo,
  } = useTimeTrackDateRange(7);
  const [scatterTracks, setScatterTracks] = useState<TimeTrackWithNoteResponse[]>(
    []
  );
  const [scatterLoading, setScatterLoading] = useState(false);

  const fetchScatterTracks = async () => {
    setScatterLoading(true);
    try {
      const data = await getTimeTracksByDateRange(scatterFrom, scatterTo);
      setScatterTracks(data);
    } catch (err) {
      console.error('Error fetching scatter time tracks:', err);
      setScatterTracks([]);
    } finally {
      setScatterLoading(false);
    }
  };

  useEffect(() => {
    fetchScatterTracks();
  }, [scatterFrom, scatterTo]);

  const dailyTotal = useMemo(() => {
    return timeTracks.reduce((sum, track) => sum + track.dailyTimeMinutes, 0);
  }, [timeTracks]);

  const activeNotesCount = useMemo(() => {
    return timeTracks.filter(track => track.dailyTimeMinutes > 0).length;
  }, [timeTracks]);

  const focusScore = useMemo(() => {
    if (dailyTotal === 0 || timeTracks.length === 0) {
      return { percentage: 0, topNoteName: 'No activity' };
    }
    const sortedTracks = [...timeTracks].sort(
      (a, b) => b.dailyTimeMinutes - a.dailyTimeMinutes
    );
    const topNote = sortedTracks[0];
    const percentage = Math.round(
      (topNote.dailyTimeMinutes / dailyTotal) * 100
    );
    const topNoteName =
      topNote.noteName.length > 15
        ? topNote.noteName.substring(0, 15) + '...'
        : topNote.noteName;
    return { percentage, topNoteName };
  }, [timeTracks, dailyTotal]);

  return (
    <div
      className={styles.activityPage}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        {/* Top Cards Section */}
        <div className={styles.cardsContainer}>
          {/* Time Radar Card */}
          <div className={styles.card}>
            <DailyTimeTracksRadar
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              data={timeTracks}
              loading={loading}
              showControls={true}
            />
          </div>

          <div className={styles.card}>
            <h6 className={styles.cardLabel}>Most Active Note</h6>
            <h3 className={styles.cardValue}>
              {loading ? '...' : mostActiveNote?.totalTimeMinutes || 0} mins
            </h3>
            <span className={styles.cardCaption}>
              {mostActiveNote?.noteName || 'No activity this week'}
            </span>
          </div>

          {/* Daily Total Card */}
          <div className={styles.card}>
            <h6 className={styles.cardLabel}>Daily Total</h6>
            <h3 className={styles.cardValue}>
              {loading ? '...' : formatTime(dailyTotal)}
            </h3>
            <span className={styles.cardCaption}>Time tracked today</span>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className={styles.metricsContainer}>
          {/* Active Notes Count Card */}
          <div className={styles.metricCard}>
            <h6 className={styles.cardLabel}>Active Notes</h6>
            <h3 className={styles.cardValue}>
              {loading ? '...' : activeNotesCount}
            </h3>
            <span className={styles.cardCaption}>Notes worked on today</span>
          </div>

          {/* Focus Score Card */}
          <div className={styles.metricCard}>
            <h6 className={styles.cardLabel}>Focus Score</h6>
            {loading ? (
              <h3 className={styles.cardValue}>...</h3>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <FocusGauge percentage={focusScore.percentage} />
              </div>
            )}
            <span className={styles.cardCaption}>{focusScore.topNoteName}</span>
          </div>

          {/* Streak Card */}
          <div className={styles.metricCard}>
            <h6 className={styles.cardLabel}>Streak</h6>
            <div className="flex items-center justify-center gap-2">
              <h3 className={styles.cardValue}>
                {streakLoading ? '...' : streak?.currentStreak || 0}
              </h3>
              {!streakLoading && streak && streak.currentStreak > 0 && (
                <span className="text-3xl">🔥</span>
              )}
            </div>
            <span className={styles.cardCaption}>Consecutive days</span>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className={styles.chartSection}>
          <WeeklyTrendChart data={weeklyTrend} loading={weeklyTrendLoading} />
        </div>

        {/* Activity Scatter Section */}
        <div className={styles.scatterSection}>
          <div className={styles.scatterPicker}>
            <DateRangePicker
              from={scatterFrom}
              to={scatterTo}
              onPreset={setScatterPreset}
              onFromChange={setScatterFrom}
              onToChange={setScatterTo}
            />
          </div>
          <div className={styles.scatterChart}>
            <ActivityScatterChart
              tracks={scatterTracks}
              from={scatterFrom}
              to={scatterTo}
              loading={scatterLoading}
            />
          </div>
        </div>

        {/* Graph Section */}
        <div className={styles.graphSection}>
          <DailyTimeTracksDataGrid
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            data={timeTracks}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};
