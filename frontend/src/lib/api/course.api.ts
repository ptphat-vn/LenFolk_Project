import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  Course,
  CreateCourseInput,
  GetCoursesQuery,
  CoursePlan,
  UpsertCoursePlanInput,
} from '@/types/course.types';
import { CoursePurchaseInput, CoursePurchaseResponse } from '@/types/coupon.types';
import { hasFileValue, toFormData } from './form-data';

function coursePayload(body: Partial<CreateCourseInput>) {
  return hasFileValue(body) ? toFormData(body) : body;
}

export const courseApi = {
  /** GET /courses — Lấy danh sách khóa học (Public) */
  getAll: async (query?: GetCoursesQuery) => {
    const res = await axiosInstance.get<APIResponse<Course[]>>('/courses', { params: query });
    return res.data;
  },

  /** POST /courses — Tạo khóa học mới (Admin only) */
  create: async (body: CreateCourseInput) => {
    const res = await axiosInstance.post<APIResponse<Course>>('/courses', coursePayload(body));
    return res.data;
  },

  /** GET /courses/:id — Lấy chi tiết khóa học (Public) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Course>>(`/courses/${id}`);
    return res.data;
  },

  /** PATCH /courses/:id — Cập nhật khóa học (Admin only) */
  update: async (id: string, body: Partial<CreateCourseInput>) => {
    const res = await axiosInstance.patch<APIResponse<Course>>(
      `/courses/${id}`,
      coursePayload(body),
    );
    return res.data;
  },

  /** DELETE /courses/:id — Xóa khóa học (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/courses/${id}`);
    return res.data;
  },

  /** PUT /courses/:id/plan — Đặt/cập nhật gói giá (CoursePlan) cho khóa học (Admin only) */
  setPlan: async (id: string, body: UpsertCoursePlanInput) => {
    const res = await axiosInstance.put<APIResponse<CoursePlan>>(`/courses/${id}/plan`, body);
    return res.data;
  },

  /**
   * POST /courses/:id/purchase — Mua lẻ khóa học (cần đăng nhập)
   * Có thể kèm couponCode để áp dụng mã giảm giá
   */
  purchase: async (id: string, body?: CoursePurchaseInput) => {
    const res = await axiosInstance.post<APIResponse<CoursePurchaseResponse>>(
      `/courses/${id}/purchase`,
      body,
    );
    return res.data;
  },
};
