import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";

type ApiResponse = {
  success: boolean;
  message: string;
};

// User tự hủy đơn thanh toán đang chờ (chưa chuyển khoản).
// PATCH /transaction-records/:id/cancel — chỉ hủy được đơn còn `pending`:
// giao dịch → failed, Enrollment liên quan → cancelled.
export const useCancelTransaction = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.patch<ApiResponse>(
        `/transaction-records/${id}/cancel`
      );
      return response.data;
    },
  });
};
