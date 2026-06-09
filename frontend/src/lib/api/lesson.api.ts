import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Lesson, CreateLessonInput, GetLessonsQuery } from '@/types/lesson.types';
import { hasFileValue, toFormData } from './form-data';

function lessonPayload(body: Partial<CreateLessonInput>) {
  return hasFileValue(body) ? toFormData(body) : body;
}

export const lessonApi = {
  /** GET /lessons — Lấy danh sách bài học (cần đăng nhập) */
  getAll: async (query?: GetLessonsQuery) => {
    const res = await axiosInstance.get<APIResponse<Lesson[]>>('/lessons', { params: query });
    return res.data;
  },

  /** POST /lessons — Tạo bài học mới (Admin only) */
  create: async (body: CreateLessonInput) => {
    const res = await axiosInstance.post<APIResponse<Lesson>>('/lessons', lessonPayload(body));
    return res.data;
  },

  /** GET /lessons/:id — Lấy chi tiết bài học (cần đăng nhập, kiểm tra subscription nếu isFree: false) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Lesson>>(`/lessons/${id}`);
    return res.data;
  },

  /** PATCH /lessons/:id — Cập nhật bài học (Admin only) */
  update: async (id: string, body: Partial<CreateLessonInput>) => {
    const res = await axiosInstance.patch<APIResponse<Lesson>>(
      `/lessons/${id}`,
      lessonPayload(body),
    );
    return res.data;
  },

  /** DELETE /lessons/:id — Xóa bài học (Admin only, tự giảm Course.totalLessons) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/lessons/${id}`);
    return res.data;
  },
};
