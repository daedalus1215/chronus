import api from "../../../../../api/axios.interceptor";
import { CreateTimeTrackRequest } from "./types/createTimeTrackRequest";
import { createTimeTrackResponse } from "./types/createTimeTrackResponse";

export const createTimeTrack = async (data: CreateTimeTrackRequest): Promise<createTimeTrackResponse> => {
  const response = await api.post<createTimeTrackResponse>(`/time-tracks`, data);
  return response.data;
}; 