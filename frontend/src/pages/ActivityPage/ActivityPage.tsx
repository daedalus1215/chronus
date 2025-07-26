import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header/Header';
import { DailyTimeTracksDataGrid } from './components/DailyTimeTracksDataGrid/DailyTimeTracksDataGrid';
import { DailyTimeTracksRadar } from './components/DailyTimeTracksRadar/DailyTimeTracksRadar';
import { getDailyTimeTracksAggregation } from '../../api/requests/time-tracks.requests';
import { TimeTrackAggregationResponse } from '../../api/dtos/time-tracks.dtos';
import styles from './ActivityPage.module.css';

export const ActivityPage: React.FC = () => {
  const [timeTracks, setTimeTracks] = useState<TimeTrackAggregationResponse[]>([]);
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

  useEffect(() => {
    fetchTimeTracks(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className={styles.activityPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.gridContainer}>
          <div className={styles.radarSection}>
            <DailyTimeTracksRadar 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              data={timeTracks}
              loading={loading}
              showControls={true}
            />
          </div>
          <div className={styles.dataGridSection}>
            <DailyTimeTracksDataGrid 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              data={timeTracks}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}; 