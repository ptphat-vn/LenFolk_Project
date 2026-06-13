import { useQuery } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { Performance } from "@/types/performances.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useGetDetailPerformance = (id: string) => {
  return useQuery({
    queryKey: ["performanceDetail", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Performance>>(`/performances/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
