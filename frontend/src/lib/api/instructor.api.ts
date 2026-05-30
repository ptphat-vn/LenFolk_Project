import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  InstructorProfile,
  CreateInstructorProfileInput,
  GetInstructorProfilesQuery,
} from '@/types/instructor.types';

export const instructorApi = {
  /** GET /instructor-profiles — Lấy danh sách hồ sơ giảng viên (cần đăng nhập) */
  getAll: async (query?: GetInstructorProfilesQuery) => {
    const res = await axiosInstance.get<APIResponse<InstructorProfile[]>>('/instructor-profiles', {
      params: query,
    });
    return res.data;
  },

  /** POST /instructor-profiles — Tạo hồ sơ giảng viên (cần đăng nhập) */
  create: async (body: CreateInstructorProfileInput) => {
    const res = await axiosInstance.post<APIResponse<InstructorProfile>>('/instructor-profiles', body);
    return res.data;
  },

  /** GET /instructor-profiles/:id — Lấy chi tiết hồ sơ giảng viên (cần đăng nhập) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<InstructorProfile>>(`/instructor-profiles/${id}`);
    return res.data;
  },

  /** PATCH /instructor-profiles/:id — Cập nhật hồ sơ giảng viên (cần đăng nhập) */
  update: async (id: string, body: Partial<CreateInstructorProfileInput>) => {
    const res = await axiosInstance.patch<APIResponse<InstructorProfile>>(
      `/instructor-profiles/${id}`,
      body,
    );
    return res.data;
  },

  /** DELETE /instructor-profiles/:id — Xóa hồ sơ giảng viên (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/instructor-profiles/${id}`);
    return res.data;
  },
};
