import api from '../axios.interceptor';
import {
  CreateTimeTrackRequest,
  CreateTimeTrackResponse,
  TimeTrackTotalResponseDto,
} from '../dtos/note.dtos';
import {
  NoteTimeTracksResponse,
  TimeTrackAggregationResponse,
  NotesByYearResponseDto,
  TimeTrackWithNoteResponse,
} from '../dtos/time-tracks.dtos';
import { WeeklyMostActiveNoteResponseDto } from '../dtos/weekly-most-active-note.dtos';
import { WeeklyTrendResponseDto } from '../dtos/weekly-trend.dtos';
import { StreakResponseDto } from '../dtos/streak.dtos';

export const getNoteTimeTracks = async (
  noteId: number
): Promise<NoteTimeTracksResponse[]> => {
  const { data } = await api.get(`/time-tracks/note/${noteId}`);
  return data;
};

export const getTimeTracksTotalByNoteId = async (
  noteId: number
): Promise<TimeTrackTotalResponseDto> => {
  const { data } = await api.get(`/time-tracks/note/${noteId}/total`);
  return data;
};

export const deleteTimeTrack = async (id: number): Promise<void> => {
  await api.delete(`/time-tracks/${id}`);
};

export const updateTimeTrack = async (
  id: number,
  payload: {
    date?: string;
    startTime?: string;
    durationMinutes?: number;
    noteId?: number;
    note?: string;
  }
): Promise<NoteTimeTracksResponse> => {
  const { data } = await api.patch(`/time-tracks/${id}`, payload);
  return data;
};

export const updateTimeTrackNote = async (
  id: number,
  note: string
): Promise<NoteTimeTracksResponse> => {
  return updateTimeTrack(id, { note });
};

export const createTimeTrack = async (
  data: CreateTimeTrackRequest
): Promise<CreateTimeTrackResponse> => {
  const response = await api.post<CreateTimeTrackResponse>(
    `/time-tracks`,
    data
  );
  return response.data;
};

export const getDailyTimeTracksAggregation = async (
  date?: string
): Promise<TimeTrackAggregationResponse[]> => {
  const params = date ? { date } : {};
  const { data } = await api.get('/time-tracks/daily', { params });
  return data;
};

export const getWeeklyMostActiveNote = async (
  date?: string
): Promise<WeeklyMostActiveNoteResponseDto> => {
  const response = await api.get<WeeklyMostActiveNoteResponseDto>(
    '/time-tracks/weekly-most-active',
    { params: date ? { date } : {} }
  );
  return response.data;
};

export const getWeeklyTrend = async (
  date?: string
): Promise<WeeklyTrendResponseDto> => {
  const response = await api.get<WeeklyTrendResponseDto>(
    '/time-tracks/weekly-trend',
    { params: date ? { date } : {} }
  );
  return response.data;
};

export const getStreak = async (date?: string): Promise<StreakResponseDto> => {
  const response = await api.get<StreakResponseDto>('/time-tracks/streak', {
    params: date ? { date } : {},
  });
  return response.data;
};

export const getNotesByYear = async (): Promise<NotesByYearResponseDto> => {
  const response = await api.get<NotesByYearResponseDto>(
    '/time-tracks/notes-by-year'
  );
  return response.data;
};

export const getTimeTracksByDateRange = async (
  from: string,
  to: string
): Promise<TimeTrackWithNoteResponse[]> => {
  const { data } = await api.get('/time-tracks/date-range', {
    params: { from, to },
  });
  return data;
};
