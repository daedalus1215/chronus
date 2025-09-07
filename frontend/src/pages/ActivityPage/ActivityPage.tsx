import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header/Header';
import { DailyTimeTracksDataGrid } from './components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid';
import { DailyTimeTracksRadar } from './components/DailyTimeTracksRadar/DailyTimeTracksRadar';
import { getDailyTimeTracksAggregation, getWeeklyMostActiveNote } from '../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../api/dtos/time-tracks.dtos';
import styles from './ActivityPage.module.css';
import { Paper, Typography } from '@mui/material';
import { WeeklyMostActiveNoteResponseDto } from '../../api/dtos/weekly-most-active-note.dtos';

export const ActivityPage: React.FC = () => {
  const [timeTracks, setTimeTracks] = useState<TimeTrackAggregationResponse[]>([]);
  const [mostActiveNote, setMostActiveNote] = useState<WeeklyMostActiveNoteResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  useEffect(() => {
    fetchTimeTracks(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchTimeTracks(selectedDate);
    fetchMostActiveNote();
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className={styles.activityPage}>
      <Header />
      <main className={styles.main}>
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
            <Typography variant="h3">{loading ? '...' : mostActiveNote?.totalTimeMinutes || 0} mins</Typography>
            <Typography variant="subtitle2">{mostActiveNote?.noteName || 'No activity this week'}</Typography>
          </Paper>

          {/* Minutes Lost Card - Placeholder */}
          <Paper className={styles.card}>
            <Typography variant="h6">Minutes Lost</Typography>
            <Typography variant="h3">642'</Typography>
            <Typography variant="subtitle2">In Meetings</Typography>
          </Paper>
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
      </main>
    </div>
  );
}; 