export type TimeTrackAggregationProjection = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

export type WeeklyTrendProjection = {
  trend: Array<{ date: string; totalMinutes: number }>;
  weeklyTotal: number;
};

export type StreakProjection = {
  currentStreak: number;
};

export type NotesByYearProjection = {
  years: Array<{
    year: number;
    notes: Array<{
      noteId: number;
      noteName: string;
      firstDate: string;
      lastDate: string;
      totalTimeMinutes: number;
      dateCount: number;
      tags: Array<{
        id: number;
        name: string;
      }>;
    }>;
  }>;
};

export type TimeTrackWithNoteProjection = {
  id: number;
  noteId: number;
  noteName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyMostActiveNoteProjection = {
  noteId: number;
  totalTimeMinutes: number;
  weekStartDate: string;
  weekEndDate: string;
  noteName: string;
} | null;

export type TimeTrackProjection = {
  id: number;
  userId: number;
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
