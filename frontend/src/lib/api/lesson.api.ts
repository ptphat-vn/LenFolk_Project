import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Lesson, CreateLessonInput } from "@/types/lesson.types";

export const lessonApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Lesson>>(`/lessons`, { params: query });
    return res.data;
  },
  create: async (body: CreateLessonInput) => {
    const res = await axiosInstance.post<APIResponse<Lesson>>(`/lessons`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Lesson>>(`/lessons/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreateLessonInput) => {
    const res = await axiosInstance.patch<APIResponse<Lesson>>(`/lessons/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Lesson>>(`/lessons/${id}`);
    return res.data;
  },
};
