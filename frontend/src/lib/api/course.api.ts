import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Course, CreateCourseInput } from "@/types/course.types";

export const courseApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Course>>(`/courses`, { params: query });
    return res.data;
  },
  create: async (body: CreateCourseInput) => {
    const res = await axiosInstance.post<APIResponse<Course>>(`/courses`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Course>>(`/courses/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreateCourseInput) => {
    const res = await axiosInstance.patch<APIResponse<Course>>(`/courses/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Course>>(`/courses/${id}`);
    return res.data;
  },
};
