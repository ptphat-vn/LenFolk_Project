import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { PracticeSession, CreatePracticeSessionInput } from "@/types/practice-session.types";

export const practiceSessionApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<PracticeSession>>(`/practice-sessions`, { params: query });
    return res.data;
  },
  create: async (body: CreatePracticeSessionInput) => {
    const res = await axiosInstance.post<APIResponse<PracticeSession>>(`/practice-sessions`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<PracticeSession>>(`/practice-sessions/${id}`);
    return res.data;
  },
  update: async (id: string, body: object) => {
    const res = await axiosInstance.patch<APIResponse<PracticeSession>>(`/practice-sessions/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<PracticeSession>>(`/practice-sessions/${id}`);
    return res.data;
  },
};
