import React, { useState, useEffect, useMemo } from 'react';
import { DailyTimeTracksDataGrid } from './components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid';
import { DailyTimeTracksRadar } from './components/DailyTimeTracksRadar/DailyTimeTracksRadar';
import { WeeklyTrendChart } from './components/WeeklyTrendChart/WeeklyTrendChart';
import {
  getDailyTimeTracksAggregation,
  getWeeklyMostActiveNote,
  getWeeklyTrend,
  getStreak,
} from '../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../api/dtos/time-tracks.dtos';
import { WeeklyTrendResponseDto } from '../../api/dtos/weekly-trend.dtos';
import { StreakResponseDto } from '../../api/dtos/streak.dtos';
import styles from './ActivityPage.module.css';
import { Box, Paper, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
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

  const fetchMostActiveNote = async () => {
    try {
      const data = await getWeeklyMostActiveNote();
      setMostActiveNote(data);
    } catch (err) {
      console.error('Error fetching most active note:', err);
      setMostActiveNote(null);
    }
  };

  const fetchWeeklyTrend = async () => {
    setWeeklyTrendLoading(true);
    try {
      const data = await getWeeklyTrend();
      setWeeklyTrend(data);
    } catch (err) {
      console.error('Error fetching weekly trend:', err);
      setWeeklyTrend(null);
    } finally {
      setWeeklyTrendLoading(false);
    }
  };

  const fetchStreak = async () => {
    setStreakLoading(true);
    try {
      const data = await getStreak();
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
    fetchMostActiveNote();
    fetchWeeklyTrend();
    fetchStreak();
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const dailyTotal = useMemo(() => {
    return timeTracks.reduce((sum, track) => sum + track.dailyTimeMinutes, 0);
  }, [timeTracks]);

  const activeNotesCount = useMemo(() => {
    return timeTracks.filter((track) => track.dailyTimeMinutes > 0).length;
  }, [timeTracks]);

  const focusScore = useMemo(() => {
    if (dailyTotal === 0 || timeTracks.length === 0) {
      return { percentage: 0, topNoteName: 'No activity' };
    }
    const sortedTracks = [...timeTracks].sort(
      (a, b) => b.dailyTimeMinutes - a.dailyTimeMinutes
    );
    const topNote = sortedTracks[0];
    const percentage = Math.round((topNote.dailyTimeMinutes / dailyTotal) * 100);
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
          <Paper className={styles.card}>
            <DailyTimeTracksRadar
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              data={timeTracks}
              loading={loading}
              showControls={true}
            />
          </Paper>

          <Paper className={styles.card}>
            <Typography variant="h6">Most Active Note</Typography>
            <Typography variant="h3">
              {loading ? '...' : mostActiveNote?.totalTimeMinutes || 0} mins
            </Typography>
            <Typography variant="subtitle2">
              {mostActiveNote?.noteName || 'No activity this week'}
            </Typography>
          </Paper>

          {/* Daily Total Card */}
          <Paper className={styles.card}>
            <Typography variant="h6">Daily Total</Typography>
            <Typography variant="h3">
              {loading ? '...' : formatTime(dailyTotal)}
            </Typography>
            <Typography variant="subtitle2">Time tracked today</Typography>
          </Paper>
        </div>

        {/* Secondary Metrics Row */}
        <div className={styles.metricsContainer}>
          {/* Active Notes Count Card */}
          <Paper className={styles.metricCard}>
            <Typography variant="h6">Active Notes</Typography>
            <Typography variant="h3">
              {loading ? '...' : activeNotesCount}
            </Typography>
            <Typography variant="subtitle2">Notes worked on today</Typography>
          </Paper>

          {/* Focus Score Card */}
          <Paper className={styles.metricCard}>
            <Typography variant="h6">Focus Score</Typography>
            {loading ? (
              <Typography variant="h3">...</Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <Gauge
                  value={focusScore.percentage}
                  valueMin={0}
                  valueMax={100}
                  width={100}
                  height={80}
                  text={`${focusScore.percentage}%`}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill:
                        focusScore.percentage >= 70
                          ? '#4caf50'
                          : focusScore.percentage >= 40
                            ? '#ff9800'
                            : '#f44336',
                    },
                  }}
                />
              </Box>
            )}
            <Typography variant="subtitle2">{focusScore.topNoteName}</Typography>
          </Paper>

          {/* Streak Card */}
          <Paper className={styles.metricCard}>
            <Typography variant="h6">Streak</Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Typography variant="h3">
                {streakLoading ? '...' : streak?.currentStreak || 0}
              </Typography>
              {!streakLoading && streak && streak.currentStreak > 0 && (
                <Typography variant="h4" component="span">
                  🔥
                </Typography>
              )}
            </Box>
            <Typography variant="subtitle2">Consecutive days</Typography>
          </Paper>
        </div>

        {/* Weekly Trend Chart */}
        <div className={styles.chartSection}>
          <WeeklyTrendChart data={weeklyTrend} loading={weeklyTrendLoading} />
        </div>

        {/* Graph Section */}
        <Paper className={styles.graphSection}>
          <DailyTimeTracksDataGrid
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            data={timeTracks}
            loading={loading}
          />
        </Paper>
      </div>
    </div>
  );
};
