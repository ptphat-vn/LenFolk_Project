import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Enrollment, GetEnrollmentsQuery } from '@/types/enrollment.types';

export const enrollmentApi = {
  /** GET /enrollments/me — User xem mình đã đăng ký course/tiết mục gì */
  getMine: async (all = false) => {
    const res = await axiosInstance.get<APIResponse<Enrollment[]>>('/enrollments/me', {
      params: all ? { all: true } : undefined,
    });
    return res.data;
  },

  /** GET /enrollments — Admin: tất cả enrollment (lọc userId/itemType/status) */
  getAll: async (query?: GetEnrollmentsQuery) => {
    const res = await axiosInstance.get<APIResponse<Enrollment[]>>('/enrollments', {
      params: query,
    });
    return res.data;
  },
};
