import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  WalletMeResponse,
  BankDetails,
  PayoutRequest,
  CreatePayoutRequestInput,
  ReviewPayoutInput,
} from '@/types/wallet.types';

export const walletApi = {
  /**
   * GET /wallets/me — Instructor xem ví và lịch sử rút tiền (cần đăng nhập)
   * Trả về thông tin wallet + danh sách payout requests của instructor
   */
  getMyWallet: async () => {
    const res = await axiosInstance.get<APIResponse<WalletMeResponse>>('/wallets/me');
    return res.data;
  },

  /**
   * PUT /wallets/bank-info — Cập nhật thông tin ngân hàng của instructor (cần đăng nhập)
   */
  updateBankInfo: async (body: BankDetails) => {
    const res = await axiosInstance.put<APIResponse<{ message: string }>>('/wallets/bank-info', body);
    return res.data;
  },

  /**
   * POST /wallets/payout — Tạo yêu cầu rút tiền (cần đăng nhập — Instructor)
   */
  createPayoutRequest: async (body: CreatePayoutRequestInput) => {
    const res = await axiosInstance.post<APIResponse<PayoutRequest>>('/wallets/payout', body);
    return res.data;
  },

  /**
   * GET /wallets/admin/payouts — Admin xem danh sách tất cả yêu cầu rút tiền (Admin only)
   */
  getAllPayouts: async () => {
    const res = await axiosInstance.get<APIResponse<PayoutRequest[]>>('/wallets/admin/payouts');
    return res.data;
  },

  /**
   * PATCH /wallets/admin/payouts/:id — Admin duyệt / từ chối yêu cầu rút tiền (Admin only)
   */
  reviewPayout: async (id: string, body: ReviewPayoutInput) => {
    const res = await axiosInstance.patch<APIResponse<PayoutRequest>>(
      `/wallets/admin/payouts/${id}`,
      body,
    );
    return res.data;
  },
};
