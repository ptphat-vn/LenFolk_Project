import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Coupon, CreateCouponInput } from '@/types/coupon.types';

export const couponApi = {
  /** GET /coupons — Lấy danh sách coupon (Admin only) */
  getAll: async () => {
    const res = await axiosInstance.get<APIResponse<Coupon[]>>('/coupons');
    return res.data;
  },

  /** POST /coupons — Tạo coupon mới (Admin only) */
  create: async (body: CreateCouponInput) => {
    const res = await axiosInstance.post<APIResponse<Coupon>>('/coupons', body);
    return res.data;
  },

  /** GET /coupons/:id — Lấy chi tiết coupon (Admin only) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Coupon>>(`/coupons/${id}`);
    return res.data;
  },

  /** PATCH /coupons/:id — Cập nhật coupon (Admin only) */
  update: async (id: string, body: Partial<CreateCouponInput>) => {
    const res = await axiosInstance.patch<APIResponse<Coupon>>(
      `/coupons/${id}`,
      body,
    );
    return res.data;
  },

  /** DELETE /coupons/:id — Xóa coupon (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/coupons/${id}`);
    return res.data;
  },
};
