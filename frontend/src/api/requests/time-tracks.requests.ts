import api from "../axios.interceptor";
import { CreateTimeTrackRequest, CreateTimeTrackResponse, TimeTrackTotalResponseDto } from "../dtos/note.dtos";
import { NoteTimeTracksResponse, TimeTrackAggregationResponse } from "../dtos/time-tracks.dtos";
import { WeeklyMostActiveNoteResponseDto } from "../dtos/weekly-most-active-note.dtos";

export const getNoteTimeTracks = async (noteId: number): Promise<NoteTimeTracksResponse[]> => {
  const { data } = await api.get(`/time-tracks/note/${noteId}`);
  return data;
};

export const getTimeTracksTotalByNoteId = async (noteId: number): Promise<TimeTrackTotalResponseDto> => {
  const { data } = await api.get(`/time-tracks/note/${noteId}/total`);
  return data;
};

export const deleteTimeTrack = async (id: number): Promise<void> => {
  await api.delete(`/time-tracks/${id}`);
}; 

export const createTimeTrack = async (data: CreateTimeTrackRequest): Promise<CreateTimeTrackResponse> => {
  const response = await api.post<CreateTimeTrackResponse>(`/time-tracks`, data);
  return response.data;
};

export const getDailyTimeTracksAggregation = async (date?: string): Promise<TimeTrackAggregationResponse[]> => {
  const params = date ? { date } : {};
  const { data } = await api.get('/time-tracks/daily', { params });
  return data;
}; 

export const getWeeklyMostActiveNote = async (): Promise<WeeklyMostActiveNoteResponseDto> => {
    const response = await api.get<WeeklyMostActiveNoteResponseDto>('/time-tracks/weekly-most-active');
    return response.data;
  };