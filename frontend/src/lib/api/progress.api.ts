import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Progress, CreateProgressInput } from "@/types/progress.types";

export const progressApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Progress>>(`/progress`, { params: query });
    return res.data;
  },
  create: async (body: CreateProgressInput) => {
    const res = await axiosInstance.post<APIResponse<Progress>>(`/progress`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Progress>>(`/progress/${id}`);
    return res.data;
  },
  update: async (id: string, body: object) => {
    const res = await axiosInstance.patch<APIResponse<Progress>>(`/progress/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Progress>>(`/progress/${id}`);
    return res.data;
  },
};
