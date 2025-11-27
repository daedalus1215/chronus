import api from "../axios.interceptor";
import { Tag } from "../dtos/tag.dtos";

export const fetchTags = async (): Promise<Tag[]> => {
    const res = await api.get("/tags");
    return res.data;
  };

export const fetchTagById = async (tagId: number): Promise<Tag> => {
    const res = await api.get(`/tags/${tagId}`);
    return res.data;
  };

export const updateTag = async (tagId: number, data: { name: string; description?: string }): Promise<Tag> => {
    const res = await api.patch(`/tags/${tagId}`, data);
    return res.data;
  };

export const deleteTag = async (tagId: number): Promise<void> => {
    await api.delete(`/tags/${tagId}`);
  };