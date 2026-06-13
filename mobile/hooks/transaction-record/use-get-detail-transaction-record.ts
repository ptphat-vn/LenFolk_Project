import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionRecord } from "@/types/transaction-records.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailTransactionRecord = (id: string) => {
  return useQuery({
    queryKey: ["transactionRecordDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<TransactionRecord>>(`/transaction-records/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
