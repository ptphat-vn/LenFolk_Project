import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionRecord } from "@/types/transaction-records.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetTransactionRecords = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["transactionRecords", params],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<TransactionRecord[]>>("/transaction-records", {
        params,
      });
      return response.data.data;
    },
  });
};
