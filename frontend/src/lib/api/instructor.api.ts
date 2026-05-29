import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { InstructorProfile, CreateInstructorProfileInput } from "@/types/instructor.types";

export const instructorApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<InstructorProfile>>(`/instructor-profiles`, { params: query });
    return res.data;
  },
  create: async (body: CreateInstructorProfileInput) => {
    const res = await axiosInstance.post<APIResponse<InstructorProfile>>(`/instructor-profiles`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<InstructorProfile>>(`/instructor-profiles/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreateInstructorProfileInput) => {
    const res = await axiosInstance.patch<APIResponse<InstructorProfile>>(`/instructor-profiles/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<InstructorProfile>>(`/instructor-profiles/${id}`);
    return res.data;
  },
};
