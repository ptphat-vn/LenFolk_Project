import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionStatus } from "@/types/payment.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// Poll trạng thái thanh toán SePay (Bước 3).
// - enabled: chỉ poll khi đang mở màn QR (truyền false để dừng).
// - tự dừng poll khi đã thanh toán (isPaid) hoặc giao dịch kết thúc.
export const useGetTransactionStatus = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["transactionStatus", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<TransactionStatus>>(
        `/transaction-records/${id}/status`
      );
      return response.data.data;
    },
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Dừng poll khi giao dịch không còn ở trạng thái chờ.
      if (status && status !== "pending") return false;
      return 4000;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};
