import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Streak, CreateStreakInput } from "@/types/streak.types";

export const streakApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Streak>>(`/streaks`, { params: query });
    return res.data;
  },
  create: async (body: CreateStreakInput) => {
    const res = await axiosInstance.post<APIResponse<Streak>>(`/streaks`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Streak>>(`/streaks/${id}`);
    return res.data;
  },
  update: async (id: string, body: object) => {
    const res = await axiosInstance.patch<APIResponse<Streak>>(`/streaks/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Streak>>(`/streaks/${id}`);
    return res.data;
  },
};
